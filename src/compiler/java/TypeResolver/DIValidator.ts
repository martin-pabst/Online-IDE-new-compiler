import { ErrorLevel } from "../../common/Error";
import { IRange } from "../../common/range/Range";
import { ErrormessageWithId } from "../../../tools/language/LanguageManager.ts";
import { TokenType } from "../TokenType";
import { JavaBaseModule } from "../module/JavaBaseModule";
import { ASTClassDefinitionNode, ASTEnumDefinitionNode, ASTFieldDeclarationNode, ASTInterfaceDefinitionNode } from "../parser/AST";
import { JavaClass } from "../types/JavaClass";
import { JCM } from "../language/JavaCompilerMessages.ts";

type PushErrorFn = (msg: ErrormessageWithId, range: IRange, module: JavaBaseModule, level?: ErrorLevel) => void;

export class DIValidator {

    static validate(
        classDeclarationNodes: ASTClassDefinitionNode[],
        interfaceDeclarationNodes: ASTInterfaceDefinitionNode[],
        enumDeclarationNodes: ASTEnumDefinitionNode[],
        pushError: PushErrorFn
    ): Map<string, ASTClassDefinitionNode> {

        const instanceMap = new Map<string, ASTClassDefinitionNode>();

        DIValidator.validateInstanceAnnotations(classDeclarationNodes, interfaceDeclarationNodes, enumDeclarationNodes, pushError, instanceMap);

        DIValidator.validateInjectAnnotations(classDeclarationNodes, pushError, instanceMap);

        DIValidator.detectCircularDependencies(classDeclarationNodes, pushError, instanceMap);

        return instanceMap;
    }

    private static validateInstanceAnnotations(
        classDeclarationNodes: ASTClassDefinitionNode[],
        interfaceDeclarationNodes: ASTInterfaceDefinitionNode[],
        enumDeclarationNodes: ASTEnumDefinitionNode[],
        pushError: PushErrorFn,
        instanceMap: Map<string, ASTClassDefinitionNode>
    ) {
        for (const ifaceNode of interfaceDeclarationNodes) {
            const annotation = ifaceNode.annotations?.find(a => a.identifier === "Instance");
            if (!annotation) continue;
            pushError(JCM.diInstanceOnNonClass(), ifaceNode.range, ifaceNode.module);
        }

        for (const enumNode of enumDeclarationNodes) {
            const annotation = enumNode.annotations?.find(a => a.identifier === "Instance");
            if (!annotation) continue;
            pushError(JCM.diInstanceOnNonClass(), enumNode.range, enumNode.module);
        }

        for (const classNode of classDeclarationNodes) {
            const annotation = classNode.annotations?.find(a => a.identifier === "Instance");
            if (!annotation) continue;

            if (!annotation.parameter) {
                pushError(JCM.diAnnotationRequiresParameter("Instance"), annotation.range, classNode.module);
                continue;
            }

            if (classNode.isMainClass) {
                pushError(JCM.diInstanceOnMainClass(), annotation.range, classNode.module);
                continue;
            }

            const resolvedType = classNode.resolvedType as JavaClass | undefined;

            if (resolvedType?.isAbstract()) {
                pushError(JCM.diInstanceOnAbstractClass(classNode.identifier), annotation.range, classNode.module);
                continue;
            }

            const name = annotation.parameter;
            if (instanceMap.has(name)) {
                const firstNode = instanceMap.get(name)!;
                pushError(JCM.diDuplicateInstanceName(name), annotation.range, classNode.module);
                pushError(JCM.diDuplicateInstanceName(name), firstNode.annotations!.find(a => a.identifier === "Instance")!.range, firstNode.module);
                continue;
            }

            if (resolvedType) {
                const hasDefaultCtor = resolvedType.methods.some(m => m.isConstructor && m.parameters.length === 0)
                    || !resolvedType.methods.some(m => m.isConstructor);
                if (!hasDefaultCtor) {
                    pushError(JCM.diInstanceNoDefaultConstructor(classNode.identifier), annotation.range, classNode.module);
                    continue;
                }
            }

            instanceMap.set(name, classNode);
        }
    }

    private static validateInjectAnnotations(
        classDeclarationNodes: ASTClassDefinitionNode[],
        pushError: PushErrorFn,
        instanceMap: Map<string, ASTClassDefinitionNode>
    ) {
        for (const classNode of classDeclarationNodes) {
            for (const fieldOrInit of classNode.fieldsOrInstanceInitializers) {
                if (fieldOrInit.kind !== TokenType.fieldDeclaration) continue;
                const fieldNode = fieldOrInit as ASTFieldDeclarationNode;

                const annotation = fieldNode.annotations?.find(a => a.identifier === "Inject");
                if (!annotation) continue;

                if (!annotation.parameter) {
                    pushError(JCM.diAnnotationRequiresParameter("Inject"), annotation.range, classNode.module);
                    continue;
                }

                if (fieldNode.isStatic) {
                    pushError(JCM.diInjectOnStaticField(), annotation.range, classNode.module);
                    continue;
                }

                if (!instanceMap.has(annotation.parameter)) {
                    pushError(JCM.diInjectUnknownName(annotation.parameter), annotation.range, classNode.module);
                }
            }
        }
    }

    private static detectCircularDependencies(
        classDeclarationNodes: ASTClassDefinitionNode[],
        pushError: PushErrorFn,
        instanceMap: Map<string, ASTClassDefinitionNode>
    ) {
        const dependencyGraph = new Map<string, string[]>();

        for (const [instanceName, classNode] of instanceMap) {
            const deps: string[] = [];
            for (const fieldOrInit of classNode.fieldsOrInstanceInitializers) {
                if (fieldOrInit.kind !== TokenType.fieldDeclaration) continue;
                const fieldNode = fieldOrInit as ASTFieldDeclarationNode;
                const injectAnnotation = fieldNode.annotations?.find(a => a.identifier === "Inject");
                if (injectAnnotation?.parameter && instanceMap.has(injectAnnotation.parameter)) {
                    deps.push(injectAnnotation.parameter);
                }
            }
            dependencyGraph.set(instanceName, deps);
        }

        const visited = new Set<string>();
        const inStack = new Set<string>();

        for (const startName of instanceMap.keys()) {
            if (visited.has(startName)) continue;
            const cycle = DIValidator.dfsCycleCheck(startName, dependencyGraph, visited, inStack, []);
            if (cycle) {
                const cycleStr = cycle.join(" -> ") + " -> " + cycle[0];
                const classNode = instanceMap.get(cycle[0])!;
                pushError(JCM.diCircularDependency(cycleStr), classNode.range, classNode.module);
                return;
            }
        }
    }

    private static dfsCycleCheck(
        name: string,
        graph: Map<string, string[]>,
        visited: Set<string>,
        inStack: Set<string>,
        path: string[]
    ): string[] | undefined {
        visited.add(name);
        inStack.add(name);
        path.push(name);

        for (const dep of (graph.get(name) ?? [])) {
            if (!visited.has(dep)) {
                const cycle = DIValidator.dfsCycleCheck(dep, graph, visited, inStack, path);
                if (cycle) return cycle;
            } else if (inStack.has(dep)) {
                const cycleStart = path.indexOf(dep);
                return path.slice(cycleStart);
            }
        }

        inStack.delete(name);
        path.pop();
        return undefined;
    }
}

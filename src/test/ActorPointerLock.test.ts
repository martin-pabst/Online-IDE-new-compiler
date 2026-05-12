import { expect, test, vi, beforeEach, afterEach } from 'vitest';
import { ActorTypes } from '../compiler/java/runtime/graphics/IActor';
import { MouseManager } from '../compiler/java/runtime/graphics/MouseManager2D';
import { ActorManager } from '../compiler/java/runtime/graphics/ActorManager';
import { ThreadState } from '../compiler/common/interpreter/ThreadState';

// --- IActor ---

test('ActorTypes includes mouseMovement', () => {
    expect(ActorTypes).toContain('mouseMovement');
});

// --- ActorManager ---

function makeActorManager() {
    const mockThread = { state: ThreadState.suspended, programStack: [] as any[] };
    const mockInterpreter = {
        keyboardManager: undefined,
        scheduler: { createThread: vi.fn().mockReturnValue(mockThread) },
        eventManager: { on: vi.fn() },
    } as any;
    return { actorManager: new ActorManager(mockInterpreter), mockThread, mockInterpreter };
}

test('ActorManager.onMouseMovement dispatches dx and dy to registered actors', () => {
    const { actorManager, mockThread } = makeActorManager();
    const mockActor = { isActing: true, _mj$onMouseMovement$void$double$double: vi.fn() } as any;

    actorManager.registerActor(mockActor, 'mouseMovement');
    actorManager.onMouseMovement(5, 10);

    expect(mockActor._mj$onMouseMovement$void$double$double).toHaveBeenCalledWith(mockThread, undefined, 5, 10);
    expect(mockThread.state).toBe(ThreadState.running);
});

test('ActorManager.onMouseMovement skips actors with isActing = false', () => {
    const { actorManager } = makeActorManager();
    const inactiveActor = { isActing: false, _mj$onMouseMovement$void$double$double: vi.fn() } as any;

    actorManager.registerActor(inactiveActor, 'mouseMovement');
    actorManager.onMouseMovement(3, 7);

    expect(inactiveActor._mj$onMouseMovement$void$double$double).not.toHaveBeenCalled();
});

test('ActorManager.onMouseMovement does nothing when no mouseMovement actors registered', () => {
    const { actorManager, mockInterpreter } = makeActorManager();

    actorManager.onMouseMovement(1, 2);

    expect(mockInterpreter.scheduler.createThread).not.toHaveBeenCalled();
});

test('ActorManager.onMouseMovement dispatches to all registered actors', () => {
    const { actorManager } = makeActorManager();
    const actor1 = { isActing: true, _mj$onMouseMovement$void$double$double: vi.fn() } as any;
    const actor2 = { isActing: true, _mj$onMouseMovement$void$double$double: vi.fn() } as any;

    actorManager.registerActor(actor1, 'mouseMovement');
    actorManager.registerActor(actor2, 'mouseMovement');
    actorManager.onMouseMovement(-2, 8);

    expect(actor1._mj$onMouseMovement$void$double$double).toHaveBeenCalledOnce();
    expect(actor2._mj$onMouseMovement$void$double$double).toHaveBeenCalledOnce();
});

// --- MouseManager ---

function makeMouseManager() {
    const canvas = { requestPointerLock: vi.fn() } as any;
    const mockActorManager = { onMouseMovement: vi.fn() };
    const mockWorld = {
        app: { canvas },
        interpreter: { actorManager: mockActorManager },
    } as any;
    return { mouseManager: new MouseManager(mockWorld, null as any), canvas, mockActorManager };
}

beforeEach(() => {
    vi.spyOn(document, 'addEventListener');
    vi.spyOn(document, 'removeEventListener');
    Object.defineProperty(document, 'exitPointerLock', {
        value: vi.fn(),
        writable: true,
        configurable: true,
    });
});

afterEach(() => {
    vi.restoreAllMocks();
});

test('MouseManager.enablePointerLock calls canvas.requestPointerLock', () => {
    const { mouseManager, canvas } = makeMouseManager();
    mouseManager.enablePointerLock();
    expect(canvas.requestPointerLock).toHaveBeenCalledOnce();
});

test('MouseManager.enablePointerLock registers pointerlockchange and pointerlockerror on document', () => {
    const { mouseManager } = makeMouseManager();
    mouseManager.enablePointerLock();
    expect(document.addEventListener).toHaveBeenCalledWith('pointerlockchange', expect.any(Function));
    expect(document.addEventListener).toHaveBeenCalledWith('pointerlockerror', expect.any(Function));
});

test('pointerlockchange handler sets isPointerLocked = true when canvas is lock element', () => {
    const { mouseManager, canvas } = makeMouseManager();
    mouseManager.enablePointerLock();

    const [, handler] = (document.addEventListener as any).mock.calls.find(
        ([event]: [string]) => event === 'pointerlockchange'
    );

    Object.defineProperty(document, 'pointerLockElement', { value: canvas, configurable: true });
    handler();
    expect(mouseManager.isPointerLocked).toBe(true);
});

test('pointerlockchange handler sets isPointerLocked = false when canvas is not the lock element', () => {
    const { mouseManager } = makeMouseManager();
    mouseManager.isPointerLocked = true;
    mouseManager.enablePointerLock();

    const [, handler] = (document.addEventListener as any).mock.calls.find(
        ([event]: [string]) => event === 'pointerlockchange'
    );

    Object.defineProperty(document, 'pointerLockElement', { value: null, configurable: true });
    handler();
    expect(mouseManager.isPointerLocked).toBe(false);
});

test('pointerlockerror handler sets isPointerLocked = false', () => {
    const { mouseManager } = makeMouseManager();
    mouseManager.isPointerLocked = true;
    mouseManager.enablePointerLock();

    const [, handler] = (document.addEventListener as any).mock.calls.find(
        ([event]: [string]) => event === 'pointerlockerror'
    );
    handler();
    expect(mouseManager.isPointerLocked).toBe(false);
});

test('MouseManager.disablePointerLock calls exitPointerLock when pointer is locked', () => {
    const { mouseManager } = makeMouseManager();
    mouseManager.isPointerLocked = true;
    mouseManager.disablePointerLock();
    expect(document.exitPointerLock).toHaveBeenCalledOnce();
    expect(mouseManager.isPointerLocked).toBe(false);
});

test('MouseManager.disablePointerLock does not call exitPointerLock when not locked', () => {
    const { mouseManager } = makeMouseManager();
    mouseManager.isPointerLocked = false;
    mouseManager.disablePointerLock();
    expect(document.exitPointerLock).not.toHaveBeenCalled();
});

test('MouseManager.disablePointerLock removes document listeners', () => {
    const { mouseManager } = makeMouseManager();
    mouseManager.enablePointerLock();
    mouseManager.isPointerLocked = false;
    mouseManager.disablePointerLock();
    expect(document.removeEventListener).toHaveBeenCalledWith('pointerlockchange', expect.any(Function));
    expect(document.removeEventListener).toHaveBeenCalledWith('pointerlockerror', expect.any(Function));
});

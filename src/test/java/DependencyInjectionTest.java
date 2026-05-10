/**::
 * Basic @Instance/@Inject: shared singleton between two classes
 */
@Instance("counter")
class Counter {
    int value = 0;
    void increment() { value++; }
    int getValue() { return value; }
}

class ClassA {
    @Inject("counter")
    Counter c;
    void inc() { c.increment(); }
}

class ClassB {
    @Inject("counter")
    Counter c;
    int get() { return c.getValue(); }
}

ClassA a = new ClassA();
ClassB b = new ClassB();
a.inc();
a.inc();
assertEquals(2, b.get(), "Shared @Instance singleton: ClassA and ClassB should see the same Counter");


/**::
 * @Inject in multiple instances of the same class share the singleton
 */
@Instance("shared")
class SharedData {
    int x = 0;
}

class User {
    @Inject("shared")
    SharedData data;
    void set(int v) { data.x = v; }
    int get() { return data.x; }
}

User u1 = new User();
User u2 = new User();
u1.set(42);
assertEquals(42, u2.get(), "Multiple instances of the same class should share the @Instance singleton");


/**::
 * @Instance class with non-primitive field
 */
@Instance("store")
class DataStore {
    ArrayList<String> items = new ArrayList<>();
    void add(String s) { items.add(s); }
    int size() { return items.size(); }
}

class Writer {
    @Inject("store")
    DataStore ds;
    void write(String s) { ds.add(s); }
}

class Reader {
    @Inject("store")
    DataStore ds;
    int count() { return ds.size(); }
}

Writer w = new Writer();
Reader r = new Reader();
w.write("hello");
w.write("world");
assertEquals(2, r.count(), "@Instance with ArrayList: writes by Writer visible through Reader");


/**::
 * Error: @Instance on an interface
 * { "expectedCompilationError": {"id": "diInstanceOnNonClass"} }
 */
@Instance("diTestFoo")
interface DiTestFoo {}


/**::
 * Error: @Instance on an enum
 * { "expectedCompilationError": {"id": "diInstanceOnNonClass"} }
 */
@Instance("diTestColor")
enum DiTestColor { RED, GREEN, BLUE }


/**::
 * Error: @Instance on an abstract class
 * { "expectedCompilationError": {"id": "diInstanceOnAbstractClass"} }
 */
@Instance("diTestShape")
abstract class DiTestShape {
    abstract void draw();
}


/**::
 * Error: duplicate @Instance name
 * { "expectedCompilationError": {"id": "diDuplicateInstanceName"} }
 */
@Instance("service")
class ServiceA {}

@Instance("service")
class ServiceB {}


/**::
 * Error: @Instance class has no default constructor
 * { "expectedCompilationError": {"id": "diInstanceNoDefaultConstructor"} }
 */
@Instance("thing")
class Thing {
    int value;
    Thing(int v) { value = v; }
}


/**::
 * Error: @Inject on a static field
 * { "expectedCompilationError": {"id": "diInjectOnStaticField"} }
 */
@Instance("repo")
class Repo {}

class Service {
    @Inject("repo")
    static Repo r;
}


/**::
 * Error: @Inject references unknown instance name
 * { "expectedCompilationError": {"id": "diInjectUnknownName"} }
 */
class Client {
    @Inject("missing")
    Object obj;
}


/**::
 * Error: circular dependency between two @Instance classes
 * { "expectedCompilationError": {"id": "diCircularDependency"} }
 */
@Instance("alpha")
class Alpha {
    @Inject("beta")
    Beta b;
}

@Instance("beta")
class Beta {
    @Inject("alpha")
    Alpha a;
}


/**::
 * Error: @Instance used without a parameter
 * { "expectedCompilationError": {"id": "diAnnotationRequiresParameter"} }
 */
@Instance
class NoName {}


/**::
 * Error: @Inject used without a parameter
 * { "expectedCompilationError": {"id": "diAnnotationRequiresParameter"} }
 */
@Instance("source")
class Source {}

class Sink {
    @Inject
    Source s;
}

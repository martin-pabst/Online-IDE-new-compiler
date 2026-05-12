/**::
 * Actor with onMouseMovement override compiles and instantiates correctly
 */
class MovementActor extends Actor {
    double lastDx = 0;
    double lastDy = 0;

    void onMouseMovement(double dx, double dy) {
        lastDx = dx;
        lastDy = dy;
    }
}

MovementActor actor = new MovementActor();
assertTrue(!actor.isDestroyed(), "MovementActor should not be destroyed after instantiation");


/**::
 * onMouseMovement stores the received dx and dy values
 */
class TrackingActor extends Actor {
    double receivedDx = 0;
    double receivedDy = 0;
    int callCount = 0;

    void onMouseMovement(double dx, double dy) {
        receivedDx = dx;
        receivedDy = dy;
        callCount++;
    }
}

TrackingActor ta = new TrackingActor();
ta.onMouseMovement(5.0, -3.0);
assertEquals(5.0, ta.receivedDx, "onMouseMovement should store dx correctly");
assertEquals(-3.0, ta.receivedDy, "onMouseMovement should store dy correctly");
assertEquals(1, ta.callCount, "onMouseMovement should have been called once");

ta.onMouseMovement(-12.5, 7.25);
assertEquals(-12.5, ta.receivedDx, "onMouseMovement should update dx on second call");
assertEquals(7.25, ta.receivedDy, "onMouseMovement should update dy on second call");
assertEquals(2, ta.callCount, "onMouseMovement should have been called twice");


/**::
 * enablePointerLock and disablePointerLock compile and run without crashing
 */
class LockTestActor extends Actor {
    void testLock() {
        enablePointerLock();
        disablePointerLock();
    }
}

LockTestActor la = new LockTestActor();
la.testLock();
assertTrue(!la.isDestroyed(), "Actor should remain valid after calling enablePointerLock/disablePointerLock");


/**::
 * Actor without onMouseMovement override does not crash on instantiation
 */
class PlainActor extends Actor {
    void act() {}
}

PlainActor pa = new PlainActor();
assertTrue(!pa.isDestroyed(), "PlainActor without onMouseMovement should instantiate fine");


/**::
 * Multiple Actor instances with onMouseMovement track their own state independently
 */
class IndependentActor extends Actor {
    double dx = 0;
    double dy = 0;

    void onMouseMovement(double dx, double dy) {
        this.dx = dx;
        this.dy = dy;
    }
}

IndependentActor a1 = new IndependentActor();
IndependentActor a2 = new IndependentActor();

a1.onMouseMovement(10.0, 20.0);
a2.onMouseMovement(-5.0, 3.0);

assertEquals(10.0, a1.dx, "a1.dx should be 10");
assertEquals(20.0, a1.dy, "a1.dy should be 20");
assertEquals(-5.0, a2.dx, "a2.dx should be -5");
assertEquals(3.0, a2.dy, "a2.dy should be 3");

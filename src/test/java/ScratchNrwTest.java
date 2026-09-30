/**::
 * scratch-nrw: getAll, find and getTouchingSprites hand out the nrw List
 * {"libraries": ["scratch-nrw"], "expectedOutput": "nrw-listen"}
 */
// The counterpart of the NRW build of Scratch for Java. The graphics classes need a
// browser, so this checks the types: the lists these methods return are the List of
// the Zentralabitur, with toFirst/hasAccess/getContent, and not java.util.List.
class Spielfeld extends Stage {
    public Spielfeld() {
        super(480, 360);
        this.add(new Gegner());
    }

    public void zaehle() {
        List<Sprite> alle = this.getAll();
        List<Gegner> gegner = this.find(Gegner.class);
        int n = 0;
        gegner.toFirst();
        while (gegner.hasAccess()) {
            Gegner g = gegner.getContent();
            g.move(1);
            n++;
            gegner.next();
        }
        alle.concat(new List<Sprite>());
    }
}

class Gegner extends Sprite {
    public void run() {
        List<Gegner> getroffen = this.getTouchingSprites(Gegner.class);
        getroffen.toFirst();
        if (getroffen.hasAccess()) getroffen.remove();
    }
}

// the rest of the NRW classes are there as well
Queue<String> q = new Queue<String>();
q.enqueue("a");
assertEquals("a", q.front(), "the NRW classes come with scratch-nrw");

print("nrw-listen");

/**::
 * scratch-nrw together with scratch and nrw loads each module once
 * {"libraries": ["scratch", "nrw", "scratch-nrw"], "expectedOutput": "einmal"}
 */
class Feld extends Stage {
    public void zaehle() {
        List<Sprite> alle = this.getAll();
        alle.toFirst();
    }
}

print("einmal");

/**::
 * scratch and nrw without scratch-nrw keep java.util.List for the sprites
 * {"libraries": ["scratch", "nrw"], "expectedCompilationError": { "id": "cantAssignValueToLocalVariable", "line": 8 }}
 */
class Feld2 extends Stage {
    public void zaehle() {
        // nrw.* makes List the nrw List, getAll gives a java.util.List
        List<Sprite> alle = this.getAll();
    }
}

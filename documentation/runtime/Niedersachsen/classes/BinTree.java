package mk.nds.adt;

import java.util.NoSuchElementException;

/**
 * Klasse BinTree zur Umsetzung des ADT Binärbaum entsprechend der Vorgaben des
 * KC Informatik für die gymnasiale Oberstufe in Niedersachsen und den
 * ergänzenden Hinweisen (Stand: Juni 2025).
 * <p>
 * Der Binärbaum ist rekursiv aufgebaut: Ein nicht leerer Baum besteht aus
 * einem Inhalt (der Wurzel) sowie einem linken und einem rechten Teilbaum, die
 * selbst wieder Binärbäume sind. Ein leerer Baum besitzt keinen Inhalt und
 * keine Teilbäume.
 * <p>
 * Bei einem leeren Baum lösen getItem, isLeaf, getLeft, getRight, setLeft und
 * setRight eine Ausnahme aus.
 *
 * @param <ContentType> Der Inhaltstyp der Knoten des Binärbaums.
 * @author Carsten Rohe (erstellt für das Landesnetzwerk Informatik Niedersachsen)
 * @version 2026.11.11
 */
public class BinTree<ContentType> {

	/** Der Inhalt der Wurzel; {@code null} bei einem leeren Baum. */
	private ContentType content;

	/** Der linke Teilbaum; {@code null} bei einem leeren Baum. */
	private BinTree<ContentType> left;

	/** Der rechte Teilbaum; {@code null} bei einem leeren Baum. */
	private BinTree<ContentType> right;

	/**
	 * Ein leerer Baum wird erzeugt. Er besitzt keinen Inhalt und keine
	 * Teilbäume.
	 */
	public BinTree() {
		content = null;
		left = null;
		right = null;
	}

	/**
	 * Ein Baum wird erzeugt. Die Wurzel erhält den übergebenen Inhalt als Wert.
	 * Der Baum besitzt jeweils einen leeren Baum als linken und rechten
	 * Teilbaum.
	 *
	 * @param content Der Inhalt der Wurzel.
	 * @throws IllegalArgumentException Wird ausgelöst, wenn der übergebene Inhalt
	 *                                  {@code null} ist.
	 */
	public BinTree(ContentType content) {
		if (content == null) {
			throw new IllegalArgumentException(
					"Der Baum kann nicht erzeugt werden. Der übergebene Inhalt darf nicht 'null' sein.");
		}
		this.content = content;
		left = new BinTree<>();
		right = new BinTree<>();
	}

	/**
	 * Wenn der Baum ein leerer Baum ist, wird der Wert wahr zurückgegeben, sonst
	 * der Wert falsch.
	 *
	 * @return {@code true}, wenn der Baum leer ist, sonst {@code false}.
	 */
	public boolean isEmpty() {
		// Ein nicht leerer Baum hat immer einen Inhalt, ein leerer nie.
		return content == null;
	}

	/**
	 * Die Operation gibt den Inhaltswert der Wurzel des Baumes zurück.
	 *
	 * @return Der Inhalt der Wurzel.
	 * @throws NoSuchElementException Wird ausgelöst, wenn der Baum leer ist.
	 */
	public ContentType getItem() {
		if (isEmpty()) {
			throw new NoSuchElementException("Der Baum ist leer. Es kann kein Inhalt ausgelesen werden.");
		}
		return content;
	}

	/**
	 * Die Wurzel des Baums erhält den übergebenen Inhalt als Wert. Bei einem
	 * leeren Baum wird zusätzlich als linker und rechter Teilbaum jeweils ein
	 * leerer Baum gesetzt.
	 *
	 * @param content Der neue Inhalt der Wurzel.
	 * @throws IllegalArgumentException Wird ausgelöst, wenn der übergebene Inhalt
	 *                                  {@code null} ist.
	 */
	public void setItem(ContentType content) {
		if (content == null) {
			throw new IllegalArgumentException(
					"Der Inhalt kann nicht gesetzt werden. Der übergebene Inhalt darf nicht 'null' sein.");
		}
		if (isEmpty()) {
			// Aus dem leeren Baum wird ein Blatt mit zwei leeren Teilbäumen.
			left = new BinTree<>();
			right = new BinTree<>();
		}
		this.content = content;
	}

	/**
	 * Wenn der Baum jeweils einen leeren Baum als linken und rechten Teilbaum
	 * besitzt, also ein Blatt ist, wird der Wert wahr zurückgegeben, sonst der
	 * Wert falsch.
	 *
	 * @return {@code true}, wenn der Baum ein Blatt ist, sonst {@code false}.
	 * @throws NoSuchElementException Wird ausgelöst, wenn der Baum leer ist.
	 */
	public boolean isLeaf() {
		if (isEmpty()) {
			throw new NoSuchElementException("Der Baum ist leer. Es kann nicht geprüft werden, ob er ein Blatt ist.");
		}
		return left.isEmpty() && right.isEmpty();
	}

	/**
	 * Die Operation gibt den linken Teilbaum zurück.
	 *
	 * @return Der linke Teilbaum.
	 * @throws NoSuchElementException Wird ausgelöst, wenn der Baum leer ist.
	 */
	public BinTree<ContentType> getLeft() {
		if (isEmpty()) {
			throw new NoSuchElementException("Der Baum ist leer. Es ist kein linker Teilbaum vorhanden.");
		}
		return left;
	}

	/**
	 * Der übergebene Baum wird als linker Teilbaum gesetzt.
	 *
	 * @param tree Der neue linke Teilbaum.
	 * @throws IllegalStateException    Wird ausgelöst, wenn der Baum leer ist.
	 * @throws IllegalArgumentException Wird ausgelöst, wenn der übergebene Baum
	 *                                  {@code null} ist.
	 */
	public void setLeft(BinTree<ContentType> tree) {
		if (isEmpty()) {
			throw new IllegalStateException("Der Baum ist leer. Es kann kein linker Teilbaum gesetzt werden.");
		}
		if (tree == null) {
			throw new IllegalArgumentException(
					"Der Teilbaum kann nicht gesetzt werden. Der übergebene Baum darf nicht 'null' sein.");
		}
		left = tree;
	}

	/**
	 * Die Operation gibt den rechten Teilbaum zurück.
	 *
	 * @return Der rechte Teilbaum.
	 * @throws NoSuchElementException Wird ausgelöst, wenn der Baum leer ist.
	 */
	public BinTree<ContentType> getRight() {
		if (isEmpty()) {
			throw new NoSuchElementException("Der Baum ist leer. Es ist kein rechter Teilbaum vorhanden.");
		}
		return right;
	}

	/**
	 * Der übergebene Baum wird als rechter Teilbaum gesetzt.
	 *
	 * @param tree Der neue rechte Teilbaum.
	 * @throws IllegalStateException    Wird ausgelöst, wenn der Baum leer ist.
	 * @throws IllegalArgumentException Wird ausgelöst, wenn der übergebene Baum
	 *                                  {@code null} ist.
	 */
	public void setRight(BinTree<ContentType> tree) {
		if (isEmpty()) {
			throw new IllegalStateException("Der Baum ist leer. Es kann kein rechter Teilbaum gesetzt werden.");
		}
		if (tree == null) {
			throw new IllegalArgumentException(
					"Der Teilbaum kann nicht gesetzt werden. Der übergebene Baum darf nicht 'null' sein.");
		}
		right = tree;
	}

	/**
	 * Der Baum wird zu einem leeren Baum, d. h. er besitzt keinen Inhalt und
	 * keine Teilbäume.
	 */
	public void setEmpty() {
		content = null;
		left = null;
		right = null;
	}
}

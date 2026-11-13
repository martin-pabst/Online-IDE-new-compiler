package mk.nds.adt;

import java.util.ConcurrentModificationException;
import java.util.Iterator;
import java.util.NoSuchElementException;

/**
 * Klasse DynArray zur Umsetzung des ADT Dynamische Reihung entsprechend der
 * Vorgaben des KC Informatik für die gymnasiale Oberstufe in Niedersachsen und
 * den ergänzenden Hinweisen (Stand: Juni 2025).
 * <p>
 * Die Nummerierung der Elemente der dynamischen Reihung beginnt mit dem Index
 * 0. Dynamische Reihungen sind iterierbar, so dass die Verwendung einer
 * for-each-Schleife zum elementweisen Auslesen einer dynamischen Reihung
 * möglich ist.
 * <p>
 * Intern werden die Inhalte in einer statischen Reihung (Array) gespeichert.
 * Ist diese voll, wird sie durch eine größere ersetzt. Eine Verkleinerung
 * findet nicht statt.
 *
 * @param <ContentType> Der Inhaltstyp der Elemente der dynamischen Reihung.
 * @author Carsten Rohe (erstellt für das Landesnetzwerk Informatik Niedersachsen)
 * @version 2026.11.11
 */
public class DynArray<ContentType> implements Iterable<ContentType> {

	/** Anzahl der Plätze, die beim Anlegen einer leeren Reihung reserviert werden. */
	private static final int INITIAL_CAPACITY = 10;

	/** Faktor, um den die Anzahl der Plätze bei einer Vergrößerung wächst. */
	private static final int GROWTH_FACTOR = 2;

	/** Statische Reihung, in der die Inhalte gespeichert werden. */
	private Object[] elements;

	/** Anzahl der tatsächlich gespeicherten Elemente. */
	private int length;

	/**
	 * Zähler für strukturelle Änderungen (Einfügen, Anhängen, Löschen). Damit
	 * erkennt ein Iterator, ob die Reihung während einer for-each-Schleife
	 * verändert wurde.
	 */
	private int modificationCount;

	/**
	 * Eine leere dynamische Reihung wird angelegt.
	 */
	public DynArray() {
		elements = new Object[INITIAL_CAPACITY];
		length = 0;
		modificationCount = 0;
	}

	/**
	 * Wenn die dynamische Reihung kein Element enthält, wird der Wert wahr
	 * zurückgegeben, sonst der Wert falsch.
	 *
	 * @return {@code true}, wenn die dynamische Reihung leer ist, sonst
	 *         {@code false}.
	 */
	public boolean isEmpty() {
		return length == 0;
	}

	/**
	 * Der Inhalt des Elements an der Position index wird zurückgegeben.
	 *
	 * @param index Die Position des Elements.
	 * @return Der Inhalt des Elements an der Position index.
	 * @throws IndexOutOfBoundsException Wird ausgelöst, wenn index kleiner als 0
	 *                                   oder größer als getLength() - 1 ist.
	 */
	@SuppressWarnings("unchecked")
	public ContentType getItem(int index) {
		if (index < 0 || index >= length) {
			throw new IndexOutOfBoundsException("Index " + index + " ist außerhalb des gültigen Bereichs.");
		}
		return (ContentType) elements[index];
	}

	/**
	 * Ein neues Element mit dem übergebenen Inhalt wird am Ende der dynamischen
	 * Reihung angefügt.
	 *
	 * @param content Der Inhalt des neuen Elements.
	 * @throws IllegalArgumentException Wird ausgelöst, wenn der übergebene Inhalt
	 *                                  {@code null} ist.
	 */
	public void append(ContentType content) {
		if (content == null) {
			throw new IllegalArgumentException("Der übergebene Inhalt darf nicht 'null' sein.");
		}
		ensureCapacity();
		elements[length] = content;
		length++;
		modificationCount++;
	}

	/**
	 * Ein neues Element mit dem übergebenen Inhalt wird an der Position index in
	 * die dynamische Reihung eingefügt. Das Element, das sich vorher an dieser
	 * Position befunden hat, und alle nachfolgenden werden nach hinten verschoben.
	 * Entspricht der Wert von index der Länge der dynamischen Reihung, so wird ein
	 * neues Element am Ende der dynamischen Reihung angefügt.
	 *
	 * @param index   Die Position des neuen Elements.
	 * @param content Der Inhalt des neuen Elements.
	 * @throws IndexOutOfBoundsException Wird ausgelöst, wenn index kleiner als 0
	 *                                   oder größer als getLength() ist.
	 * @throws IllegalArgumentException  Wird ausgelöst, wenn der übergebene Inhalt
	 *                                   {@code null} ist.
	 */
	public void insertAt(int index, ContentType content) {
		if (index < 0 || index > length) {
			throw new IndexOutOfBoundsException("Index " + index + " ist außerhalb des gültigen Bereichs.");
		}
		if (content == null) {
			throw new IllegalArgumentException("Der übergebene Inhalt darf nicht 'null' sein.");
		}
		ensureCapacity();
		// Die Elemente ab Position index rücken um eine Position nach hinten.
		System.arraycopy(elements, index, elements, index + 1, length - index);
		elements[index] = content;
		length++;
		modificationCount++;
	}

	/**
	 * Der Inhalt des Elementes an der Position index wird durch den übergebenen
	 * Inhalt ersetzt.
	 *
	 * @param index   Die Position des Elements.
	 * @param content Der neue Inhalt.
	 * @throws IndexOutOfBoundsException Wird ausgelöst, wenn index kleiner als 0
	 *                                   oder größer als getLength() - 1 ist.
	 * @throws IllegalArgumentException  Wird ausgelöst, wenn der übergebene Inhalt
	 *                                   {@code null} ist.
	 */
	public void setItem(int index, ContentType content) {
		if (index < 0 || index >= length) {
			throw new IndexOutOfBoundsException("Index " + index + " ist außerhalb des gültigen Bereichs.");
		}
		if (content == null) {
			throw new IllegalArgumentException("Der übergebene Inhalt darf nicht 'null' sein.");
		}
		// Ersetzen ändert die Struktur nicht, daher bleibt modificationCount gleich.
		elements[index] = content;
	}

	/**
	 * Das Element an der Position index wird entfernt. Alle folgenden Elemente
	 * werden um eine Position nach vorne geschoben.
	 *
	 * @param index Die Position des zu entfernenden Elements.
	 * @throws IndexOutOfBoundsException Wird ausgelöst, wenn index kleiner als 0
	 *                                   oder größer als getLength() - 1 ist.
	 */
	public void delete(int index) {
		if (index < 0 || index >= length) {
			throw new IndexOutOfBoundsException("Index " + index + " ist außerhalb des gültigen Bereichs.");
		}
		// Die Elemente hinter Position index rücken um eine Position nach vorne.
		System.arraycopy(elements, index + 1, elements, index, length - index - 1);
		length--;
		// Den frei gewordenen letzten Platz leeren, damit der Inhalt nicht
		// unnötig im Speicher gehalten wird.
		elements[length] = null;
		modificationCount++;
	}

	/**
	 * Die Anzahl der Elemente der dynamischen Reihung wird zurückgegeben.
	 *
	 * @return Die Anzahl der Elemente.
	 */
	public int getLength() {
		return length;
	}

	/**
	 * Interne Hilfsmethode: Ist die statische Reihung voll, wird sie durch eine
	 * um den Faktor GROWTH_FACTOR größere ersetzt, in die alle bisherigen Inhalte
	 * übernommen werden.
	 */
	private void ensureCapacity() {
		if (length == elements.length) {
			Object[] newElements = new Object[elements.length * GROWTH_FACTOR];
			System.arraycopy(elements, 0, newElements, 0, length);
			elements = newElements;
		}
	}

	/**
	 * Gibt einen Iterator zurück, der die Elemente der dynamischen Reihung der
	 * Reihe nach liefert. Diese Methode wird von der for-each-Schleife genutzt.
	 * <p>
	 * Wird die Reihung während des Durchlaufens durch append, insertAt oder
	 * delete verändert, löst der nächste Zugriff des Iterators eine
	 * {@link ConcurrentModificationException} aus. Das Ersetzen mit setItem ist
	 * dagegen erlaubt.
	 *
	 * @return Ein Iterator über die Elemente der dynamischen Reihung.
	 */
	@Override
	public Iterator<ContentType> iterator() {
		return new DynArrayIterator();
	}

	/**
	 * Interne Klasse für das elementweise Durchlaufen der dynamischen Reihung.
	 */
	private class DynArrayIterator implements Iterator<ContentType> {

		/** Position des Elements, das als Nächstes geliefert wird. */
		private int currentIndex = 0;

		/** Stand des Änderungszählers beim Erzeugen des Iterators. */
		private int expectedModificationCount = modificationCount;

		@Override
		public boolean hasNext() {
			return currentIndex < length;
		}

		@Override
		@SuppressWarnings("unchecked")
		public ContentType next() {
			if (modificationCount != expectedModificationCount) {
				throw new ConcurrentModificationException(
						"Die dynamische Reihung wurde während des Durchlaufens verändert.");
			}
			if (!hasNext()) {
				throw new NoSuchElementException("Es ist kein weiteres Element vorhanden.");
			}
			ContentType content = (ContentType) elements[currentIndex];
			currentIndex++;
			return content;
		}
	}
}

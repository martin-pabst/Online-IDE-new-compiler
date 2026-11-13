package mk.nds.adt;

import java.util.NoSuchElementException;

/**
 * Klasse Queue zur Umsetzung des ADT Schlange entsprechend der Vorgaben des KC
 * Informatik für die gymnasiale Oberstufe in Niedersachsen und den ergänzenden
 * Hinweisen (Stand: Juni 2025).
 * <p>
 * Intern wird die Schlange als einfach verkettete Liste umgesetzt. Die Schlange
 * kennt ihr vorderstes und ihr letztes Element; jedes Element verweist auf das
 * nachfolgende. Angehängt wird am Ende, entnommen wird vorne. Daher benötigen
 * enqueue, dequeue und head unabhängig von der Größe der Schlange stets gleich
 * viel Zeit.
 *
 * @param <ContentType> Der Inhaltstyp der Elemente der Schlange.
 * @author Carsten Rohe (erstellt für das Landesnetzwerk Informatik Niedersachsen)
 * @version 2026.11.11
 */
public class Queue<ContentType> {

	/** Das vorderste Element der Schlange; {@code null} bei einer leeren Schlange. */
	private Node<ContentType> headNode;

	/** Das letzte Element der Schlange; {@code null} bei einer leeren Schlange. */
	private Node<ContentType> tailNode;

	/**
	 * Eine leere Schlange wird angelegt.
	 */
	public Queue() {
		headNode = null;
		tailNode = null;
	}

	/**
	 * Wenn die Schlange kein Element enthält, wird der Wert wahr zurückgegeben,
	 * sonst der Wert falsch.
	 *
	 * @return {@code true}, wenn die Schlange leer ist, sonst {@code false}.
	 */
	public boolean isEmpty() {
		return headNode == null;
	}

	/**
	 * Der Inhalt des vordersten Elements der Schlange wird zurückgegeben, das
	 * Element aber nicht entnommen.
	 *
	 * @return Der Inhalt des vordersten Elements.
	 * @throws NoSuchElementException Wird ausgelöst, wenn die Schlange leer ist.
	 */
	public ContentType head() {
		if (isEmpty()) {
			throw new NoSuchElementException("Die Schlange ist leer. Es kann kein Inhalt ausgelesen werden.");
		}
		return headNode.content;
	}

	/**
	 * Ein neues Element mit dem angegebenen Inhalt wird am Ende an die Schlange
	 * angehängt.
	 *
	 * @param content Der Inhalt des neuen Elements.
	 * @throws IllegalArgumentException Wird ausgelöst, wenn der übergebene Inhalt
	 *                                  {@code null} ist.
	 */
	public void enqueue(ContentType content) {
		if (content == null) {
			throw new IllegalArgumentException("Der übergebene Inhalt darf nicht 'null' sein.");
		}
		Node<ContentType> newNode = new Node<>(content);
		if (isEmpty()) {
			// Das einzige Element ist zugleich das vorderste und das letzte.
			headNode = newNode;
		} else {
			// Das neue Element wird hinter das bisher letzte gehängt.
			tailNode.next = newNode;
		}
		tailNode = newNode;
	}

	/**
	 * Das vorderste Element der Schlange wird entnommen. Der Inhalt dieses
	 * Elements wird zurückgegeben.
	 *
	 * @return Der Inhalt des entnommenen Elements.
	 * @throws NoSuchElementException Wird ausgelöst, wenn die Schlange leer ist.
	 */
	public ContentType dequeue() {
		if (isEmpty()) {
			throw new NoSuchElementException("Die Schlange ist leer. Es kann kein Element entnommen werden.");
		}
		ContentType content = headNode.content;
		// Das nachfolgende Element wird zum neuen vordersten.
		headNode = headNode.next;
		if (headNode == null) {
			// Die Schlange ist jetzt leer, daher gibt es auch kein letztes Element mehr.
			tailNode = null;
		}
		return content;
	}

	/**
	 * Interne Klasse für ein einzelnes Element (einen Knoten) der Schlange.
	 *
	 * @param <ContentType> Der Inhaltstyp des Elements.
	 */
	private static class Node<ContentType> {

		/** Der im Element gespeicherte Inhalt. */
		private ContentType content;

		/** Das nachfolgende Element; {@code null} beim letzten Element. */
		private Node<ContentType> next;

		/**
		 * Ein Element mit dem übergebenen Inhalt wird erzeugt. Es hat noch keinen
		 * Nachfolger.
		 *
		 * @param content Der Inhalt des Elements.
		 */
		private Node(ContentType content) {
			this.content = content;
			this.next = null;
		}
	}
}

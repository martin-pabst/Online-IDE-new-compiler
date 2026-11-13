package mk.nds.adt;

import java.util.NoSuchElementException;

/**
 * Klasse Stack zur Umsetzung des ADT Stapel entsprechend der Vorgaben des KC
 * Informatik für die gymnasiale Oberstufe in Niedersachsen und den ergänzenden
 * Hinweisen (Stand: Juni 2025).
 * <p>
 * Intern wird der Stapel als einfach verkettete Liste umgesetzt. Der Stapel
 * kennt nur sein oberstes Element; jedes Element verweist auf das darunter
 * liegende. Abgelegt und entnommen wird immer vorne an der Liste, daher
 * benötigen push, pop und top unabhängig von der Größe des Stapels stets
 * gleich viel Zeit.
 *
 * @param <ContentType> Der Inhaltstyp der Elemente des Stapels.
 * @author Carsten Rohe (erstellt für das Landesnetzwerk Informatik Niedersachsen)
 * @version 2026.11.11
 */
public class Stack<ContentType> {

	/** Das oberste Element des Stapels; {@code null} bei einem leeren Stapel. */
	private Node<ContentType> topNode;

	/**
	 * Ein leerer Stapel wird angelegt.
	 */
	public Stack() {
		topNode = null;
	}

	/**
	 * Wenn der Stapel kein Element enthält, wird der Wert wahr zurückgegeben,
	 * sonst der Wert falsch.
	 *
	 * @return {@code true}, wenn der Stapel leer ist, sonst {@code false}.
	 */
	public boolean isEmpty() {
		return topNode == null;
	}

	/**
	 * Der Inhalt des obersten Elements des Stapels wird zurückgegeben, das Element
	 * aber nicht entnommen.
	 *
	 * @return Der Inhalt des obersten Elements.
	 * @throws NoSuchElementException Wird ausgelöst, wenn der Stapel leer ist.
	 */
	public ContentType top() {
		if (isEmpty()) {
			throw new NoSuchElementException("Der Stapel ist leer. Es kann kein Inhalt ausgelesen werden.");
		}
		return topNode.content;
	}

	/**
	 * Ein neues Element mit dem übergebenen Inhalt wird oben auf den Stapel
	 * gelegt.
	 *
	 * @param content Der Inhalt des neuen Elements.
	 * @throws IllegalArgumentException Wird ausgelöst, wenn der übergebene Inhalt
	 *                                  {@code null} ist.
	 */
	public void push(ContentType content) {
		if (content == null) {
			throw new IllegalArgumentException("Der übergebene Inhalt darf nicht 'null' sein.");
		}
		// Das neue Element verweist auf das bisher oberste und wird selbst das oberste.
		topNode = new Node<>(content, topNode);
	}

	/**
	 * Das oberste Element des Stapels wird entnommen. Der Inhalt dieses Elements
	 * wird zurückgegeben.
	 *
	 * @return Der Inhalt des entnommenen Elements.
	 * @throws NoSuchElementException Wird ausgelöst, wenn der Stapel leer ist.
	 */
	public ContentType pop() {
		if (isEmpty()) {
			throw new NoSuchElementException("Der Stapel ist leer. Es kann kein Element entnommen werden.");
		}
		ContentType content = topNode.content;
		// Das darunter liegende Element wird zum neuen obersten.
		topNode = topNode.next;
		return content;
	}

	/**
	 * Interne Klasse für ein einzelnes Element (einen Knoten) des Stapels.
	 *
	 * @param <ContentType> Der Inhaltstyp des Elements.
	 */
	private static class Node<ContentType> {

		/** Der im Element gespeicherte Inhalt. */
		private ContentType content;

		/** Das darunter liegende Element; {@code null} beim untersten Element. */
		private Node<ContentType> next;

		/**
		 * Ein Element mit dem übergebenen Inhalt und Nachfolger wird erzeugt.
		 *
		 * @param content Der Inhalt des Elements.
		 * @param next    Das darunter liegende Element.
		 */
		private Node(ContentType content, Node<ContentType> next) {
			this.content = content;
			this.next = next;
		}
	}
}

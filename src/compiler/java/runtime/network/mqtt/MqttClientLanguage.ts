import { lm } from "../../../../../tools/language/LanguageManager";

export class MqttClientLanguage {

    static MqttClientClassComment = lm({
        'de': 'MQTT-Client, siehe https://github.com/mqttjs/MQTT.js',
        'en': 'MqttClient, see https://github.com/mqttjs/MQTT.js',
        'fr': 'MqttClient, voir https://github.com/mqttjs/MQTT.js'
    })

    static MqttClientConstructorComment = lm({
        'de': 'Erzeugt einen neuen MQTT-Client, der mit dem angegebenen Server verbunden werden soll.',
        'en': 'Creates a new MQTT client that is to be connected to the specified server.',
        'fr': 'Crée un nouveau client MQTT qui doit être connecté au serveur spécifié.'
    })

    static subscribeComment = lm({
        'de': 'Abonniert das angegebene MQTT-Topic.',
        'en': 'Subscribes to the specified MQTT topic.',
        'fr': "S'abonne au sujet MQTT spécifié."
    })

    static subscribeHandlerComment = lm({
        'de': 'Abonniert das angegebene MQTT-Topic und registriert den angegebenen Handler, der aufgerufen wird, wenn eine Nachricht zu diesem Topic empfangen wird.',
        'en': 'Subscribes to the specified MQTT topic and registers the specified handler that is called when a message is received for this topic.',
        'fr': "S'abonne au sujet MQTT spécifié et enregistre le gestionnaire spécifié qui est appelé lorsqu'un message est reçu pour ce sujet."
    })

    static HandlerOnMessageComment = lm({
        'de': 'Methode, die aufgerufen wird, wenn eine Nachricht zu dem MQTT-Topic empfangen wird, zu dem der SingleTopicHandler registriert ist.',
        'en': 'Method that is called when a message is received for the MQTT topic to which the SingleTopicHandler is registered.',
        'fr': "Méthode appelée lorsqu'un message est reçu pour le sujet MQTT auquel le SingleTopicHandler est enregistré."
    })

    static HandlerInterfaceComment = lm({
        'de': 'Interface für die Behandlung von Nachrichten, die zu einem einzelnen MQTT-Topic empfangen werden.',
        'en': 'Interface for handling messages to a single MQTT topic.',
        'fr': "Interface pour gérer les messages à un seul sujet MQTT."
    })

    static multiTopicHandlerOnMessageComment = lm({
        'de': 'Methode, die aufgerufen wird, wenn eine Nachricht zu einem der MQTT-Topics empfangen wird, zu dem der MultiTopicHandler registriert ist.',
        'en': 'Method that is called when a message is received for one of the MQTT topics to which the MultiTopicHandler is registered.',
        'fr': "Méthode appelée lorsqu'un message est reçu pour l'un des sujets MQTT auxquels le MultiTopicHandler est enregistré."
    })

    static multiTopicHandlerInterfaceComment = lm({
        'de': 'Interface für die Behandlung von Nachrichten, die zu mehreren MQTT-Topics empfangen werden.',
        'en': 'Interface for handling messages to multiple MQTT topics.',
        'fr': "Interface pour gérer les messages à plusieurs sujets MQTT."
    })

    static publishComment = lm({
        'de': 'Sendet eine Nachricht zum angegebenen MQTT-Topic.',
        'en': 'Publishes a message to the specified MQTT topic.',
        'fr': "Envoie un message au sujet MQTT spécifié."
    })

    static CloseComment = lm({
        'de': 'Schließt die Verbindung zum MQTT-Server.',
        'en': 'Closes the connection to the MQTT server.',
        'fr': "Ferme la connexion au serveur MQTT."
    })

}
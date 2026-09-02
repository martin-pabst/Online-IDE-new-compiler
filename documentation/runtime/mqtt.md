# Time table: 
  * 10 min einlesen        (hauptsächlich auf https://github.com/mqttjs/MQTT.js)
  * 20 min folgendes überlegen + schreiben:


```java
class MqttClient{
    MqttClient(String server);  // starts the connection process but doesn't wait for it to finish, if another method needs an active connection it aits for one or throws a timeout or connectionFailed error
    
    void subscribe(String topic) throws MqttError;

    void subscribe(String topic, SingleTopicHandler handler) throws MqttError;

    @override
    void onMessage(String topic, String message);

    void registerHandler(MultiTopicHandler handler);
}

interface SingleTopicHandler{
    void handle(String message);
}

interface MultiTopicHandler{
    void handle(String topic, String message);
}

class MqttError{
    ...
}


// example use 1
class MyMqttClient{
    MyMqttClient(){
        super("myserverurl.com");
        subscribe("myTopic1");
        subscribe("myTopic2");
    }

    @override
    void onMessage(String topic, String message){
        if(topic == "myTopic1"){
            println(message);
        }else{
            println("topic 2!");
        }
    }
}
new MyMqttClient();


// example use 2    (this is so much nicer, but needs clojures.)
MqttClient client = new MqttClient("myserverurl.com");
client.subscribe("myTopic1", (String message)->{
    println("topic 1!");
});
client.subscribe("myTopic2");
client.registerHandler((String topic, String message)->{
    println("topic 1 or 2!");
});
```

Danke für das gelungene Konzept!

### Gedanken dazu:
  * Die zweigleisige Verwendungsmöglichkeit (Überschreiben von `onMessage` oder Registrieren eines Handlers) gefällt mir richtig gut!
  * Auch die Idee mit den zwei Typen von Handlern (`SingleTopicHandler`, `MultiTopicHandler`) ist richtig vorbildlich schön. Da die Online-IDE keine Namensräume (`import`...) kennt und MQTT ein sehr kleines Randgebiet der API bleibt, wäre es aber gut, möglichst wenige Bezeichner im globalen Namensraum neu einzuführen. Ich würde daher dazu tendieren, den `SingleTopicHandler` wegzulassen.
  * Der Bezeichner `MqttClient` ist eindeutig und klar. Da es in der Online-IDE keine Namensräume gibt, wäre mein Vorschlag, statt `MultiTopicHandler` den Bezeichner `MqttHandler` oder `MqttMessageHandler` zu wählen. Letzteres würde schön mit dem Bezeichner der Methode `onMessage` korrespondieren. 
  * Es wäre gut, wenn der Konstruktor  blockieren würde bis die Verbindung steht. Möglich wäre das mit der Methode [`connectAsync`](https://github.com/mqttjs/MQTT.js#connect-async). Wenn man den Konstruktor mit der 'java'-calling convention implementiert, bekommt er eine callback-Funktion hereingereicht, die aufgerufen wird, wenn die Methode zurückkehrt. Ein Muster für den Aufruf findest du in der Methode `_mj$send$HttpResponse$HttpRequest` in der Datei [`HttpClientClass`](../../src/compiler/java/runtime/network/HttpClientClass.ts). Dort wird die Methode `fetch` asynchron aufgerufen. Das Java-Programm blockiert, bis sie zurückkehrt, gleichzeitig bleibt die GUI der Online-IDE aber responsiv, da die Javascript-Methode `_mj$send$HttpResponse$HttpRequest` sofort zurückkehrt.
  * [`connectAsync`](https://github.com/mqttjs/MQTT.js#connect-async) bietet die Möglichkeit, ein Options-Objekt mitzuliefern ([mögliche Options siehe hier](https://github.com/mqttjs/MQTT.js#client)), insbesondere `username` und `password`. Es wäre gut, wenn man diese Möglichkeit weiterreichen könnte. Leider gibt es keine einfache Möglichkeit, in Java einer Methode eine beliebige Menge von key-value-pairs als Parameter mitzugeben. Was hältst Du von einem optionalen String-Parameter, der ein json-Objekt enthält? Der Konstruktor könnte dann bspw. so aufgerufen werden:
```java
MqttClient client = new MqttClient("myserverurl.com", "{'username' = 'Theo', 'password' = 'Test'}");
```
  * Nützlich wäre noch die Methode [publish](https://github.com/mqttjs/MQTT.js#publish-async)


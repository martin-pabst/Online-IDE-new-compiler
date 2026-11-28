# New functionality "Class enrolment"

# GUI
  * If a user is a student then the user menu (file @src\client\main\gui\UserMenu.ts) should contain an additional menu item "In Klasse einschreiben" 
   * If the student clicks this item then the online-ide asks for the enrolment key (german: "Einschreibeschlüssel"). You may simply use the browser's prompt method to achieve this.
   * The online-ide sends a request to `servlet/enrolInClass`. This servlet expects an `record EnrolToClassRequest(String key){}`-object in json format.
   * The server either returns a `BaseErrorResponse`-Object or a `BaseSuccessResponse`-Object. Both are json-Objects of this type:
       `{success: boolean; message: string}`
    `BaseSuccessResponse` has additional field `className` of type string.
    * In both cases alert the user what has happened:
      * if `success == true`: Alert "Du bist jetzt der Klasse " + response.className + " zugeordnet.". 
      * if `success == false`: Alert "Fehler beim Zuordnen zur Klasse: " + message
  * Make all labels, column headers and messages multi language by adding texts to class `UserMenuMessages`. Use existing texts in `AdminMessages` where appropriate.
  * Test the functionality by starting `npm run dev` and using playwright. Server is found at URL http://localhost:3000/  . Use username michael and password Mi16102010
  * Use key 12345 for enrolment in class '10a 25/26'.


Ask me questions until you are 98% sure what i need.


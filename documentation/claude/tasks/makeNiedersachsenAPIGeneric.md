# Make Niedersachsen-API generic
  * In Folder @src\compiler\java\runtime\modules\niedersachsen you find the Online-IDE-specific implementation of the Niedersachsen-API. The API is currently not generic.
  * In Folder @documentation\runtime\Niedersachsen\classes you find the new original Java classes of the Niedersachsen-API, which are generic. Please use them as templates to make the Online-IDE-specific implementation of the Niedersachsen-API generic.
  * I guess it suffices to update the type declarations inside the array __javaDeclarations for each class. 
  


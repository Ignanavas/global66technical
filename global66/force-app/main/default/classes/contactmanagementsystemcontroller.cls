public with sharing class ContactManagementSystemController {
    @AuraEnabled
    private static void cContacts(List<Contacto> contacts) {
        try{
            List<Contact> contactosValidos = new List<Contact>();

            for (Contact c : contacts) {
                if (c.Email == null)    { //Controlo la condicion principal que el correo no este en nulo antes de armar la lista a insetar
                   contactosValidos.add(c);
                } 
                else    {
                    throw new AuraHandledException('El campo Email es obligatorio para todos los contactos.');     
                }
            }
            if (!contactosValidos.isEmpty())    {
                insert contactosValidos;
                }
        }
        catch(Exception e) {
            throw new AuraHandledException('Algo salio mal: ' + e.getMessage());
        }
    }
    @AuraEnabled
    private static void uContacts(List<Contact> contacts) {
        try{
            List<Contact> contactosValidos = new List<Contact>();
            for (Contact c : contacts) {
                if (c.Email != null) {
                    contactosValidos.add(c);
                } 
                else    {
                    throw new AuraHandledException('El campo Email es obligatorio para todos los contactos.');
                }
            }
            if (!contactosValidos.isEmpty())    {
                insert contactosValidos;
                }
        }
        catch(Exception e) {
            throw new AuraHandledException('Algo salio mal: ' + e.getMessage());
        }
    }
    @AuraEnabled
    public static void dContacts(List<Id> contactIds) {
        try{
            List<Contact> contactsToDelete = [SELECT Id FROM Contact WHERE Id IN :contactIds];
            if (!contactsToDelete.isEmpty()) {
                delete contactsToDelete;
            } else {
                throw new AuraHandledException('No se encontraron contactos para eliminar.');
            }
        }
        catch(Exception e) {
            throw new AuraHandledException('Algo salio mal: ' + e.getMessage());
        }
    }
 
  
    private static List<Contact> rContacts() {
        try{
            List<Contact> contacts = [SELECT Id, FirstName, LastName, Email, Phone FROM Contact WHERE Email != null];
            return contacts;
        }
        catch(Exception e) {
            throw new AuraHandledException('Algo salio mal: ' + e.getMessage());
        }
    }





}

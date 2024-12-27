/**
 * This class contains unit tests for validating the behavior of Apex classes
 * and triggers.
 *
 * Unit tests are class methods that verify whether a particular piece
 * of code is working properly. Unit test methods take no arguments,
 * commit no data to the database, and are flagged with the testMethod
 * keyword in the method definition.
 *
 * All test methods in an org are executed whenever Apex code is deployed
 * to a production org to confirm correctness, ensure code
 * coverage, and prevent regressions. All Apex classes are
 * required to have at least 75% code coverage in order to be deployed
 * to a production org. In addition, all triggers must have some code coverage.
 * 
 * The @isTest class annotation indicates this class only contains test
 * methods. Classes defined with the @isTest annotation do not count against
 * the org size limit for all Apex scripts.
 *
 * See the Apex Language Reference for more information about Testing and Code Coverage.
 */
@isTest
public class ContactManagementSystemControllerTest {

    @testSetup
    static void setupData() {
        try {
            Contact contact = new Contact(
                FirstName = 'Juan',
                LastName = 'Perez',
                Email = 'juan.perez@example.com',
                Phone = '123456789'
            );
            insert contact;
        } catch (Exception e) {
            System.debug('Error en setupData: ' + e.getMessage());
            throw e;
        }
    }


    @isTest
    public static void cContactsTest() {
        List<Contact> contactsToCreate = new List<Contact>{
            new Contact(FirstName = 'Carlos', LastName = 'Gomez', Email = 'carlos.gomez@example.com', Phone = '555555555'),
            new Contact(FirstName = 'Laura', LastName = 'Martinez', Email = 'laura.martinez@example.com', Phone = '666666666')
        };
        Test.startTest();
        ContactManagementSystemController.cContacts(contactsToCreate);
        Test.stopTest();
        List<Contact> insertedContacts = [SELECT Id, Email FROM Contact WHERE Email IN ('carlos.gomez@example.com', 'laura.martinez@example.com')];
        System.assertEquals(insertedContacts.size(), 2, 'Los contactos deberían haberse insertado correctamente.');
    }
      
    @isTest
    public static void uContactsTest() {
          Contact contact = [SELECT Id, FirstName, LastName, Email, Phone FROM Contact WHERE Email = 'juan.perez@example.com' LIMIT 1];
          contact.Phone = '111111111';
          Test.startTest();
          ContactManagementSystemController.uContacts(new List<Contact>{contact});
          Test.stopTest();
          Contact updatedContact = [SELECT Phone FROM Contact WHERE Id = :contact.Id];
          System.assertEquals(updatedContact.Phone, '111111111', 'El teléfono debería haberse actualizado correctamente.');
      }
    
    @isTest
    static void dContacts() {
        Contact contact = [SELECT Id FROM Contact WHERE Email = 'juan.perez@example.com' LIMIT 1];
        Id contactId = contact.Id;
        Test.startTest();
        ContactManagementSystemController.dContacts(new List<Id>{contactId});
        Test.stopTest();
        List<Contact> deletedContacts = [SELECT Id FROM Contact WHERE Id = :contactId];
        System.assertEquals(deletedContacts.size(), 0, 'El contacto debería haber sido eliminado.');
    } // El test dura 400ms , se puede deber a que el objeto contacts tiene 4 relaciones y salesforce verifica de fondo en los delete que no se rompa la integridad entre estas.
    
    @isTest
    static void rContacts() {
        Test.startTest();
        List<Contact> contacts = ContactManagementSystemController.rContacts();
        Test.stopTest();
        System.assertNotEquals(contacts.size(), 0, 'Debería haber al menos un contacto.');
        System.assertEquals(contacts[0].Email, 'juan.perez@example.com', 'El primer contacto debería ser el creado.');
    }

    
    
}

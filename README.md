# passwortSafe

Author Fabian Bätscher & Jonathan Furrer & Jannis Beichler

Sicherheitsaspekte:

- Login:

  1. user schickt login daten and das Backend
  2. Backend hashed Passwort mit Sha-256 und zusätzlich mit MD-5.
  3. Backend überprüft Hash.
  4. Wenn login erfolgreich bekommt man ein Autentication token und ein normales token mit dem MD-5 Hash.
  5. User ist eingeloggt.

- Neues Passwort hinzufügen:

  1. User gibt daten für neues Passwort ein.
  2. Backend holt MD-5 Hash vom token.
  3. Verschlüsselt die Daten von dem User mit dem MD-5 hash als Key.
  4. Daten werden gespeichert.

- Passwort anzeigen:

  1. Überprüfen ob ein gültiges Autentificierungs token existiert.
  2. Id vom aktuellen User wird geholt.
  3. Alle Passwörter von der aktuellen user holen.
  4. MD-5 Hash von dem token holen
  5. Mit dem MD-5 Hash als key Passwörter entschlüsseln.
  6. Entschlüsselte Daten ans Frontend senden.

- Passwort Updaten:

  1. Id vom aktuellen Eintrag wird geholt.
  2. User gibt neue daten ein um das Passwort zu ändern.
  3. Backend holt MD-5 Hash vom token.
  4. Verschlüsselt die Daten von dem User mit dem MD-5 hash als Key.
  5. Daten werden gespeichert.

- Registrieren

  1. Registrierungs daten werden vom User ans backend gesendet und es wird überprüft ob das Passwort genug stark ist.
  2. User name wird überprüft ob er bereits existiert.
  3. Wenn er existiert, gibt es einen Fehler code zurück. Wenn nicht geht es mit dem nächsten Schritt weiter.
  4. neue Id wird dem User gegeben.
  5. Passwort wir mit SHA-256 gehashed.
  6. Id + UserName + Passwort wird in der Datenbank gespeichert.
  7. Mit dem Passwort wird ein MD-5 Hash erstellt.
  8. Wenn eingeloggt bekommt man ein Autentication token und ein normales token mit dem MD-5 Hash.
  9. User ist eingeloggt und neu registriert.

- Logout

  1.  Löschen alle tokens

Installation

- Backend: npm ci (für clean Installation)
- Frontend: npm ci (für clean installation)

- Docker:
  - Docker Desktop öffnen
  - auf den Ordner dc wechseln im Terminal "cd dc"
  - dort ls machen
  - nach docker-compose up suchen
  - im Terminal docker-compose up eingeben

Backend

- Wir haben 5 Endpoints: login, register, addNewPassword,
  getPasswords und updatePassword

  - login:
    Im Login fragen wir ab, ob die User daten stimmen. Wenn das nicht der Fall ist, wird eine Meldung ausgegeben, dass die User daten falsch sind. Im Falle das
     der User kann sich einloggen, weil das im Hintergrund gehashte Passwort mit dem gehashten Passwort in der Datenbank abgeglichen wurde und stimmt. Dann wird zum  
     Entschlüsseln der Passwörter des Users nochmals das eingegebene Passwort mit einem anderen hashing Prozess verschlüsselt. Dieser ist dann der Key zum Entschlüsseln seiner Passwörter. Beide gehashten Passwörter werden in tokens im Browser gespeichert.

  - register:
    Hier ist der einzige Unterschied, dass man diesen Endpoint nutzt, um sich als Neukunde einzuloggen. Danach wird man direkt eingeloggt und das Passwort wird zweimal gehasht und in Tokens gespeichert.

  - addNewPassword:
     Wenn man ein neues Passwort zu seinem Passwortmanager hinzufügen möchte, kann man diesen Endpoint nutzen. Das neue eingegebene Passwort wird direkt verschlüsselt,
    mit dem gehashten Passwort des Users. Welches das Master Password ist.

  - getPasswords:
    Dieser Endpoint gibt die entschlüsselten Passwörter des Users zurück, und zwar nur diese des Users.

  - updatePassword:
    Mit diesem Endpoint kann man eines seiner Passwörter in seinem Passwortmanager abändern. Sobald man das gemacht hat, wird es wieder verschlüsselt mit dem Master Passwort des Users.
  - logout:
    - In diesem Endpoint, wird der User augeloggt und die Tokens gelöscht

Frontend

- Login Page:

  - Auf dieser Seite hat es zwei Input-Felder für Username und Passwort. Dann kann man das mit einem Button, welches ein Submit hat, und abschicken ans Backend.

- Passwort Page

  - Hier werden alle Passwörter des Users angezeigt. Aber nicht ganz angezeigt. Sie werden noch durch ein Feld geschützt, welches anstatt des Passwortes 5 Punkte  
    anzeigt. Erst, wenn man den Button Show geklickt, wird das dazugehörige Passwort angezeigt.

- Register Page

  - Auf dieser Seite hat es zwei Input-Felder für Username und Passwort. Dann kann man das mit einem Button, welches ein Submit hat, und abschicken ans Backend. Man
    wird direkt eingeloggt und auf die Passwort Page weitergeleitet.

- Update Passwort Page
  - Hier kann man ein ausgewähltes Passwort updaten. Man wird danach direkt an die Passwort-Page weitergeleitet.

Relfexion:

- Jannis:
  Ich fand das Projekt eine gelungene Arbeit. Wir konnten selber planen, wie wir das Projekt aufbauen wollen und mit welcher Sprache wir es machen. Diese  
  Das Projekt hat die Teamarbeit gestärkt und uns gezeigt, wie man ein Passwort und diese Informationen am besten sichern kann. z. B.
  SQL Injektion, Schutz etc. Wir hätten uns bei der Planung etwas mehr Gedanken machen müssen, aber auch trotzdem haben wir durch Fleiss und effektives arbeiten unser Projekt noch fertig geschafft.

- Jonathan:
  Ich fand das Projekt sehr spannend auch wen ich erst später dazu kam. Ich habe trozdem sehr viel neuse gelernt auf welche dinge man alles achten muss um die Passwörter möglichst sicher speichern zu können und konnte auch nochmals mir node js etwas genauer anschauen. Zudem fand ich auch das wir uns sehr gut absprechen konnten wer für was zuständig ist.

- Fabian:
  Ich fand das Projekt sehr spannend und habe sehr viel über das Thema Verschlüsselung, hashing und Docker gelernt. Zudem habe ich auch gelernt, wie man ein Login sicher machen kann. Ich hatte am Anfang etwas Schwierigkeiten mit den CORS und bekam immer wieder Errors. Dies konnte ich aber gut lösen. Am Anfang des Projekts habe ich alles dockerisiert, um alles einfach starten zu können.

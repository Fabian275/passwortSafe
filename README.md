# passwortSafe

Author Fabian Bätscher & Jonathan Furrer & Jannis Beichlers

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
  Ich fand das Projekt eine gelugene Arbeit. Wir konnten selber planen, wie wir das projekt aufbauen wollen und mit welcher Sprache wir es machen. Diese  
  Projekt hat die Team Arbeit gestärkt und uns gezeigt, wie man ein Passwort und desen Infos ambesten sicher kann. Zb SQl Injections schützen etc. Wir hätten uns bei der Planung etwas mehr gedanken machen müssen aber auch trozdem haben wir durch fleiss und effektives arbeiten unser projekt noch fertig geschafft.

- Jonathan: Ich fand das Projekt sehr spannend auch wen ich erst später dazu kam. Ich habe trozdem sehr viel neuse gelernt auf welche dinge man alles achten muss um die Passwörter möglichst sicher speichern zu können und konnte auch nochmals mir node js etwas genauer anschauen. Zudem fand ich auch das wir uns sehr gut absprechen konnten wer für was zuständig ist.

- Fabian:

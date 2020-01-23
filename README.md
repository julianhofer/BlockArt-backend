## BlockArt Backend

Hier befindet sich die Backendlogik für das Projekt BlockArt. 
Die Datnbank befindet sich auf einem MySql Server mit der URL sql88.your-server.de
Aktuell ist das Backend nirgends deployt und funktioniert deshalb nur auf localhost auf Port 3000.

Um das Projekt auszuführen, ist Node.js nötig. 

Um alle dependecies zu installieren muss nur in dem backend Ordner der Befehl 'npm install' ausgeführt werden. 
Installiert wird dann:
- Express (node.js framework)
- MySql (MySql driver für Node)
- Body-parser (handels the post body request)

Um das Projekt zu starten wird der Befehl 'node index' ausgeführt.

Wenn man einzelne APIs testen will geht das am besten mit Postman, welchen man seperat installieren muss. Danach muss das `BlockArt.postman_collection.json´ welches sich im backend/test Ordner befindet importiert werden. In diesem habe ich bereits alle API Aufrufe definiert.

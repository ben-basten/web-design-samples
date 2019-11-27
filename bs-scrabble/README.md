## BS Scrabble

This is a knockoff game of Scrabble that uses Express JS, Socket.io, jQuery, and Vue.js to make a responsive multiplayer drag-and-drop interface. It *generally* follows Scrabble rules, but don't forget that it still is "BS Scrabble". 

Note: if both players pass their move in succession it is considered the end of the game.

---

**How to Run the Projects**

First, make sure that Node.js and MongoDB are installed on your machine.

*In the local directory of each project:*

* In a new Windows command prompt instance, run the `mongod` command to start the Mongo daemon
* In another command prompt instance, enter `mongo` to start the Mongo command shell
* To install Node dependencies, use the `npm install` command in the Node command prompt
* To run the one-time database population script, enter the command `node makeDictionaryDB.js`
    * Make sure that the script outputs "Operation Successful". If you don't see the success message, make sure that Mongo is running and try again.
* One all of this setup is complete, use the `npm start` command to start the server

---

**Enjoy BS Scrabble!**
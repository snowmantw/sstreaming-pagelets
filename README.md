Testing automatically merging and streaming pagelets.

To test:

        node ./server.js
        
then open your browser with URL `http://127.0.0.1:3000`,
it will also print results in your console.


Benifits: 

* No need to modify server's source codes when pagelets changed.

Cost:

* Server must parse the pagelet's HTML file to get all information.

About cache:

Server may use cache to prevent read files everytime.

I'm also considering to put whole single-page-application in user's browser by using `localStorage`.
This tech can help us manage this "application" like ordinary applications in OS.

We can even use version number to control the application's "updating" mechanism.
In the first response to the client, a tiny script should check server's version and 
decide whether the application in `localStorage` should be updated or not. 

---

License

GPLv3

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

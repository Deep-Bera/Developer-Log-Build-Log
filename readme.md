UserSchema
name, email, password, role (user/moderator/admin), timestamps
ProjectSchema
userId, name, stack, startDate, status (building/complete),
isPublic, reportCount, isHidden, timestamps
LogSchema
projectId, userId, entryType (decision/blocker/win/learn),
content, tags, rawTelemetry, embedding, timestamps

1. stack — optional array validation
   javascriptstack: {
   optional: true,
   isArray: {
   errorMessage: "Stack must be an array",
   },
   },
   optional: true means if the user doesn't send stack at all, validation skips it — no error. But if they do send it, isArray kicks in and checks that it's actually an array and not a string or number. So ["React", "Node"] passes, but "React" fails.

2. stack._ — validating each item inside the array
   javascript"stack._": {
   isString: {
   errorMessage: "Each stack item must be a string",
   },
   notEmpty: {
   errorMessage: "Stack item cannot be empty",
   },
   trim: true,
   },
   The \* is a wildcard — it means "apply these rules to every element inside the stack array." So if someone sends ["React", "", 123], it catches the empty string and the number individually. Without this, isArray only checks that stack is an array — it doesn't care what's inside it.

3. isISO8601 — date format validation
   javascriptisISO8601: {
   errorMessage: "Start date must be a valid date",
   },
   ISO 8601 is the international standard date format — looks like "2024-07-13" or "2024-07-13T10:30:00Z". This rejects random strings like "yesterday" or "13/07/2024" and only accepts properly formatted dates. MongoDB stores dates internally, but it needs to receive them in a recognisable format first — ISO 8601 is the safest choice.

   startDate: {
   type: Date,
   default: Date.now,
   },
   Mongoose handles this transformation for you automatically behind the scenes. Because you explicitly defined type: Date, Mongoose intercepts that large millisecond integer right before it hits the database and casts it into a proper BSON Date object (which looks like a standard ISO date string: 2026-07-13T22:41:00.000Z).

When you open MongoDB Atlas to look at your data, you will see a clean, readable date timestamp, not a giant number.

⚠️ One Critical Mongoose Rule to Remember
Notice how you wrote default: Date.now without parentheses ()? That is exactly how it should be.

default: Date.now (Correct): You are passing a reference to the function. Mongoose will execute this function dynamically every single time a new project is created, saving the exact current time.

default: Date.now() (Wrong): If you add parentheses, JavaScript runs the function immediately when your server starts up. Every single project created after that would share the exact same timestamp—the moment your backend server turned on.

4. created another VerifyProjectOwener middle ware to re-use the DB call ...it will also prevent from calling DB for the same oparation ..ok so i have used this middlw ware in two of the controller ...for updating the name and for changing the visibility of the porject ...(visit update controller and visibility controller or submit for better understanding )
   so that the purpose of the middleware can be used ...we could use this middleware in other routs also , to elemenate the DB call oparation ....but i am currently going with the normal way ....as its a small project making DB call should not be a problem ...

5. go through the protected rotue in the frontend because its quite differecnt from what sir have taught in the class.
6. for the useEffect in the ProjectCard component ...
   useEffect with empty [] runs once when the component mounts.

Inside it, we attach an event listener to the document — meaning
every mouse click anywhere on the page triggers handleClickOutside.

handleClickOutside checks two things:

1. does the menu ref exist?
2. was the click outside the menu div?

if both are true → close the menu.
if the click was inside the menu → contains() returns true → menu stays open.

The return inside useEffect is the cleanup function.
It runs when the component unmounts (removed from screen).
It removes the event listener from the document.

Without cleanup → the listener keeps running even after the card
is gone → dead code running on every click → memory leak.

Cleanup ensures the listener lives and dies with the component.

# tasks Management  API


A task looks like this

```json
{
  "id": 2,
  "nameTask": "Clear cache",
  "instruction": "ea4e16aa311275684925b3815b5202fa:69f575c4f79188f1bda171d072f28975a797dc162998293fdab6f1f799e39611bf179ce0df1ab943caa68ccfd34c0c55"
}
```


### Task ID

It could be a chance to talk about the `++` operator and the off-by-one error
(why is `tasks.length + 1` the correct initial value?)


### Make some requests

If you `npm i && npm run dev` you should be able to hit the API at
`localhost:4000`

Try getting a single task with

```bash
curl -v -XGET 'http://localhost:4000/tasks/3' | json_pp
```

Does it work? What do you see in the request and response? (N.b. in the output
of cURL, anything with a `>` is part of the request, and anything with a `<` is
part of the response.)

Why did we choose `/3` and not `?id=3`? Which is the better implementation? Why?

Try getting many tasks with

```bash
curl -v -XGET 'http://localhost:4000/tasks' | json_pp
```

and

```bash
curl -v -XGET 'http://localhost:4000/tasks?nameTask=' | json_pp
```

Try creating a task with

```bash
curl -v -XPOST \
-H "Content-type: application/json" \
-d '{ "nameTask" : "", "instruction" : "" }' \
'http://localhost:4000/tasks' | json_pp
```

The API sends back the created resource! Why might this be useful for users of
the API?



The big concepts at play are

- [encryption](https://swe-docs.netlify.app/backend/encryption)
- [hashing](https://swe-docs.netlify.app/backend/hashing)
- the [basic auth](https://swe-docs.netlify.app/backend/basic-auth.html)
  protocol



### encrypt.js

In `utils/encrypt.js` we can see the helper functions which encrypt and decrypt
data. There's quite a lot going on here and apprentices might want to search for
something simpler but less secure.

In order to use the functions, you will need to generate a 32-byte key. Recall
that **1 byte = 8 bits**, so 32 bytes is 256 bits, as required by the SHA256
algorithm that AES is based on. The function expects these 32 bytes as hex.

```bash
openssl rand -hex 32
```

would give us

```bash
df11c0c1d288a5dd9fc5e1aa0b06cca0b591244e8f033d47f23130dd2ac2c2a3
```

(You will notice that this is 64 characters long: 1 byte in hex is represented
by a pair of characters.)

Save your key in the `.env` file, then you can add some nameTask to `encrypt.js`

```js
const text = 'Hello, world!'
const encrypted = encrypt(text)
const decrypted = decrypt(encrypted)

console.log(encrypted)
console.log(decrypted)
```

to demonstrate it. It is worth talking about why we put this in a `.env` file
and let them see you doing this step.

### Encrypting user data

In `tasks.js` we can see that new posts are now being encrypted!

Try adding `console.log` in the `POST /tasks` endpoint so you can see the data
which actually gets stored, then try:

```bash
curl -v -XPOST \
-H "Content-type: application/json" \
-d '{ "nameTask" : "", "instruction" : "" }' \
'http://localhost:4000/tasks' | json_pp
```

Notice that the data is encrypted in the data store, but decrypted before being
returned by the API.

### Creating a user

To create a user, hit

```bash
curl -v -XPOST \
-H 'Authorization: Basic dGVzdEB1c2VyLmNvbTpwYXNzd29yZDEyMw==' \
'http://localhost:4000/user' | json_pp
```

Note that `dGVzdEB1c2VyLmNvbTpwYXNzd29yZDEyMw==` is the Base 64 encoding of the
string `'test@user.com:password123'`. This is the standard way of sending
credentials with basic auth. See
[basic auth](https://swe-docs.netlify.app/backend/basic-auth.html) for more
information.

You could add a `console.log(users)` in this endpoint to verify that the
password gets hashed and salted.

### basicAuth

Take a look at the `basicAuth.js` middleware. It parses out the credentials from
the auth header and saves them in the `req` object for use by other
middleware/controllers.

This is implemented in the `GET /user` endpoint, which checks the password
against the stored value before sending back the user's data. We can say that
the `GET /user` endpoint is password protected.

Try accessing it with the header (you need to `POST` this user first!)

```bash
curl -v -XGET \
-H 'Authorization: Basic dGVzdEB1c2VyLmNvbTpwYXNzd29yZDEyMw==' \
'http://localhost:4000/user' | json_pp
```

without the header

```bash
curl -v -XGET \
'http://localhost:4000/user' | json_pp
```

or with the wrong password

```bash
curl -v -XGET \
-H 'Authorization: Basic dGVzdEB1c2VyLmNvbTpwYXNzd29yZDEyNA==' \
'http://localhost:4000/user' | json_pp
```

## Next steps

The apprentices are challenged to implement encryption and basic auth for
themselves. They will likely want to rely on libraries as much as possible: many
frameworks have canonical ways of doing these things which abstract much of the
complexity away. Encourage apprentices to go with the flow of what their
framework recommends. Express.js is very unopinionated so a lot of this feels
very manual, but there are libraries like `passport` which provide abstractions
and are well documented.

Apprentices shouldn't try to memorise what they've seen in the demo, but rather
use the documentation for their framework to implement the spec. Their
particular implementation might look very different and that is fine (encouraged
even!)

## Tier 1 — MVP Application - CRUD and REST
As a User, I want to read entries from the database
As a User, I want to add entries to the database
As a User, I want to delete entries from the database
As a User, I want to edit entries in the database
As a User, I expect to do all of the above by accessing RESTful routes
As a User, I want to log in to a deployed app. Reference the Deployment section for instructions.


## Tier 2 - Login, Hashing
As a User, I want to be able to log in to my API
As a User, I want any passwords saved to be hashed and salted before saved to the database (note: If you use OAuth, you might not even store passwords at all!)

## Tier 3 - Register
As a potential User, I want to be able to sign up for the API
As a signed-up User, I want to be granted authorization to access the API
## Tier 4 - Authorization
As a User, I want my API protected from unauthorized Users
As an unauthorized User, I want a helpful message telling me I do not have access to the API
(optional, but recommended): As a user, I want to receive a helpful error message anytime there is a problem with the request (i.e. error handling middleware)
As a User, I expect not to be able to create new entities without first logging in / authenticating in some way (token/session)
As a User, I want my data to only be accessible by myself
As a User, I want my data to only be editable/deletable by myself
One example of how we implemented authorization is the Protect the Puppies exercise, but this could take many different forms.
Note: By protecting the “deletability” or “editability” of an entity, we don’t mean strictly just that. It could mean any level of security. For example, if we make a SpongeBob app, the app should allow only SpongeBob to post recipes, others to see them, but Plankton not to see them at all. Your app’s premise should determine what this authorization tier looks like. Customize the requirements for this tier, based on your API.

## Tier 5 - Associated Data
In addition to the Tier 1 MVP criteria…
As a User, I want to be able to read a single entry
As a User requesting a single entry, I want to see the associated user info and other associated data. For example, if your API is a concert, instead of just the concert, I want to see who created the concert entry, as well as the associated location data, artist info, and attendees coming to the event.

## Tier 6 - Admin vs User
As an Admin, I want to have a special super-user account type that allows access to content Users don’t have access to
As a basic User, when requesting a list of all entries, I expect to only see my own entries (not entries of other users)
As an Admin, when requesting a list of all entries, I expect to be able to see all entries, regardless of user/owner
As an Admin, I want to be able to edit other users’ information via the API
As an Admin, I want to be able to delete or edit any entity, regardless of user/owner
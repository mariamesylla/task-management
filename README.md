# task-management

# SWE tasks 

This branch implements a very basic API which allows users to `POST` and `GET`
tasks.

A cupcake looks like this

```json
{
  "id": 2,
  "name": "",
  "instructions": "leave outside for an hour"
}
```

## Coach Notes

The focus on this session is building principled APIs. You will find that the
code in this API is imperfect in many ways, and that is a good thing. The reason
for giving you a codebase up front rather than starting from scratch means we
can model _codebase exploration_ and _refactoring_ - two very important skills
on-the-job.

As you explore the codebase with the apprentices, be sure to point out any of
the features which align with the learning objectives, and make as many
improvements as you wish (but please don't push refactors to the remote
branch!). You could take suggestions from the apprentices, drop hints to see if
they spot some refactors, or take the lead if they seem hesitant.

## Things to see and do

### Cupcake ID

It could be a chance to talk about the `++` operator and the off-by-one error
(why is `++id` the correct incrementing of the id and not `id++`?)

### Response codes

Have a look at the response codes and see if apprentices recognise any of them.
Have they used these before? Why are they important?

### Error handling and validation

There isn't much! Where might we want to implement some error handling or
validation? Can apprentices suggest any points where errors may occur that
require handling? Anything more we could do to improve validation?

### Make some requests

If you `npm i && npm run dev` you should be able to hit the API at
`localhost:4000`

Try getting a single cupcake with

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
curl -v -XGET 'http://localhost:4000/tasks?name=' | json_pp
```

What other query params could we provide to the users to make their life easier?
(E.g. pagination, sorting).

What design problems are there with this endpoint? (E.g. what if there are two
million rows of data?)

Try creating a cupcake with

```bash
curl -v -XPOST \
-H "Content-type: application/json" \
-d '{ "flavor" : "marble", "instructions" : "just heat up and enjoy" }' \
'http://localhost:4000/tasks' | json_pp
```

The API sends back the created resource! Why might this be useful for users of
the API?

## Next steps

Apprentices will be given the specification for Snippr, and also some guidance
on which framework aligns with their language. It is their turn to head off and
try to implement the spec for themselves.



This branch refactors the basic auth flow to use tokens, which allows for a much
improved user experience.

## Coach notes

The big concept here is [tokens](https://mv-swe-docs.netlify.app/backend/tokens).
We're using JWTs to demonstrate this.

The framework the apprentice is working with might already have pushed them in
the direction of tokens when they were exploring basic auth last week. This is
fine! The implementation here is quite manual so we can really see what is going
on under the hood.

## Things to see and do

### Create a token secret

This could be anything, but 32 random bytes is a safe bet:

```bash
openssl rand -base64 32
```

produces

```bash
XmIxju7Rm+oxHWWI68pVuBMk8Az3woLTdDs/qd8yZcA=
```

Create your own, or use this one, and save it as `TOKEN_SECRET` in the `.env`
file just as we did with the `ENCRYPTION_KEY` in the previous session.

### Create a user

In this new token based world, we create a user and then sign them in.

```bash
curl -v -XPOST \
-H 'Authorization: Basic dGVzdEB1c2VyLmNvbTpwYXNzd29yZDEyMw==' \
'http://localhost:4000/user' | json_pp
```

creates the user, and

```bash
curl -v -XPOST \
-H 'Authorization: Basic dGVzdEB1c2VyLmNvbTpwYXNzd29yZDEyMw==' \
'http://localhost:4000/user/login' | json_pp
```

signs them in. The latter command should provide you with an accessToken in the
response. Something like:

```bash
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QHVzZXIuY29tIiwiaWF0IjoxNjg2OTMxNTIzfQ.R7ZCtD6ieMkIriDQYN0s_DPHC1lMyM5CIGRp1UFbblo
```

If you were to sign in again, you would get a different token each time.

### Access a resource

All of the `'/tasks'` endpoints have been protected. In order to access them,
you don't need to send your password again, but instead you send your token!

```bash
curl -v -XGET 'http://localhost:4000/tasks?flavor=chocolate' | json_pp
```

will fail, but

```bash
curl -v -XGET \
-H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QHVzZXIuY29tIiwiaWF0IjoxNjg2OTMxNTIzfQ.R7ZCtD6ieMkIriDQYN0s_DPHC1lMyM5CIGRp1UFbblo' \
'http://localhost:4000/tasks?flavor=chocolate' | json_pp
```

should succeed.

Try changing a single character in the token and see what happens. This prevents
hackers from spoofing tokens. Try also changing the `TOKEN_SECRET` and using the
correct access token - it should fail because the secret we use to check the
token must be the same secret we used to sign it.

If you split the token at the `'.'` characters, you can decode the parts from
Base 64 to utf-8 so that you can see what they contain.

### authorize.js

This is the middleware which parses out the token, and then checks that it was
signed with the `TOKEN_SECRET`, verifying that it really came from our server.

Have a look at the lines. At what point to we check the token? What is the
difference between a `401` and a `403` error code?

## Next steps

As mentioned, the frameworks the apprentices are using might implement
token-based authentication in very different ways, and they might not need to do
much to handle the verification of tokens and handling of secrets. The
underlying protocol should be roughly the same, however, so encourage them to
lean into their framework's documentation and not be too worried if the
implementation of auth looks quite different.

Focus on the requirements in the spec.

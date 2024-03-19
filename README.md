# tasks Management  API


A task looks like this

```json
{
  "id": 2,
  "nameTask": "Clear cache",
  "instruction": "ea4e16aa311275684925b3815b5202fa:69f575c4f79188f1bda171d072f28975a797dc162998293fdab6f1f799e39611bf179ce0df1ab943caa68ccfd34c0c55"
}
```

### Make some requests

If you `npm i && npm run dev` you should be able to hit the API at
`localhost:4000`

Get a single task with

```bash
curl -v -XGET 'http://localhost:4000/tasks/3' | json_pp
```

Get many tasks with

```bash
curl -v -XGET 'http://localhost:4000/tasks' | json_pp
```

and

```bash
curl -v -XGET 'http://localhost:4000/tasks?nameTask=' | json_pp
```

Create a task with

```bash
curl -v -XPOST \
-H "Content-type: application/json" \
-d '{ "nameTask" : "", "instruction" : "" }' \
'http://localhost:4000/tasks' | json_pp
```

### encrypt.js

In `utils/encrypt.js` we can see the helper functions which encrypt and decrypt
data. 

In order to use the functions, you will need to generate a 32-byte key.
 **1 byte = 8 bits**, so 32 bytes is 256 bits, as required by the SHA256
algorithm that AES is based on. The function expects these 32 bytes as hex.

```bash
openssl rand -hex 32
```

would give us

```bash
df11c0c1d288a5dd9fc5e1aa0b06cca0b591244e8f033d47f23130dd2ac2c2a3
```

This key should be saved in the `.env` file.


### Encrypting user data

In `tasks.js` we can see that new tasks are now being encrypted!

## Create a new task with 
```bash
curl -v -XPOST \
-H "Content-type: application/json" \
-d '{ "nameTask" : "", "instruction" : "" }' \
'http://localhost:4000/tasks' | json_pp
```

The data is encrypted in the data store, but decrypted before being
returned by the API.

### Create a token secret

This could be anything, but 32 random bytes is a safe bet:

```bash
openssl rand -base64 32
```

produces

```bash
XmIxju7Rm+oxHWWI68pVuBMk8Az3woLTdDs/qd8yZcA=
```

Save it as `TOKEN_SECRET` in the `.env`
file just as we did with the `ENCRYPTION_KEY`.

### Creating a user

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

### basicAuth

The `basicAuth.js` middleware parses out the credentials from
the auth header and saves them in the `req` object for use by other
middleware/controllers.

This is implemented in the `POST/user` and we POST/user/login endpoint.

### Access a resource

All of the `'/tasks'` endpoints have been protected. In order to access them,
you don't need to send your password again, but instead you send your token!

```bash
curl -v -XGET 'http://localhost:4000/tasks' | json_pp
```

will fail, but

```bash
curl -v -XGET \
-H 'Authorization: Access eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QHVzZXIuY29tIiwiaWF0IjoxNjg2OTMxNTIzfQ.R7ZCtD6ieMkIriDQYN0s_DPHC1lMyM5CIGRp1UFbblo' \
'http://localhost:4000/tasks' | json_pp
```

should succeed.


### authorize.js

This is the middleware which parses out the token, and then checks that it was
signed with the `TOKEN_SECRET`, verifying that it really came from our server.


## To create an authorization header, we can do this through
    echo -n 'magnan@taskm.com:forever11' | base64
    bWFnbmFuQHRhc2ttLmNvbTpmb3JldmVyMTE=

    echo -n 'admin@taskm.com:rootuser' | base64
    YWRtaW5AdGFza20uY29tOnJvb3R1c2Vy
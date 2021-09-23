# ExpressPlate

This project is a minmal boilerplate for Express.

It contains jwt generation (see /login), jwt decoding (see middleware), modification of the global Express namespace and the possiblity to use Typed request/response objects (`req: Express.Request, res: TypedResponse<{ UserName: string }>).

## /login

```typescript

    app.post('/login', function (req: TypedRequestBody<{ username: string, password: string }>, res: TypedResponse<{ Success: boolean, JWT?: string | undefined }>) {

        console.log(`Loggin in. Username=${req.body.username}, Password=<hidden>`);

        const jwt = Login(req.body);
        if (jwt) {
            res.append('Authorization', jwt);
            res.status(200).json({ Success: true, JWT: jwt });
        }
        else
            res.status(200).json({ Success: false });

    });

```


## Middleware for decoding JWT

```typescript

    app.use(function JWTDecoderMiddleware(req: Express.Request, res: Express.Response, next: Express.NextFunction) {

        const authorization = req.headers.authorization;
        if (authorization && authorization.startsWith("Bearer ")) {
            const u = DecodeJWT(authorization.substring(7));
            if (u)
                req.User = u;
        }

        next();
    });

```

## /me - with access level check inside of route

```typescript

    app.get('/me', function (req: Express.Request, res: TypedResponse<{ UserName: string }>) {

        if (!HasAccessLevel(req, res, ["User"]))
            return;

        res.status(200).json({ "UserName": req.User.Name });

    });

```


## /me2 - with access level check implemented as middleware

```typescript

    app.get('/me2',
        (rq, rs, n) => HasAccessLevelMiddleware(rq, rs, n, ["User"]),
        (req: Express.Request, res: TypedResponse<{ UserName: string }>) => {

            res.status(200).json({ "UserName": req.User.Name });

        });

```

## Typed Body/Query and Response


As a Bonus, the incoming Body/Query and Response.Body can be TypeScripted as:

```typescript
    app.get('/ping', function (_req: Express.Request, res: TypedResponse<{ Pong: string }>) {
        res.status(200).json({ Pong: new Date().toISOString() });
    });

```

## Starting

Start with one of:

```text
nodemon
F5 in VSCode
node.exe -r ts-node/register/transpile-only ./src/index.ts
node.exe -r ts-node/register ./src/index.ts
```

## Curl

The following commands are written for Windows

```curl

# Login as Foo

curl -X POST -H "Content-Type: application/json" -d "{\"username\":\"Foo\",\"password\":\"Bar\"}" http://localhost:3001/login

# Login as root

curl -X POST -H "Content-Type: application/json" -d "{\"username\":\"root\",\"password\":\"Banana1\"}" http://localhost:3001/login

# Take the jwt from either the header (add flag `-v` to view headers) as:

set TOKEN=eyJhbGciOiJIUzI1NiIsIn..... 

# Use the token

curl -H "Authorization: Bearer %TOKEN%" http://localhost:3001/me
curl -H "Authorization: Bearer %TOKEN%" http://localhost:3001/me
curl http://localhost:3001/ping

# User Foo cannot reach this call

curl -H "Authorization: Bearer %TOKEN%" http://localhost:3001/admin/test


```

## Enjoy :)

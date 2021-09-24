import Express from 'express';
import http from 'http';
import { TypedResponse, TypedRequestBody, AccessLevel } from './types';
import cors from 'cors';
import { Login, DecodeJWT } from './userlist';

let app: Express.Application | undefined = undefined;

export function InitializeExpress(): Express.Application {

    const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

    // *************************************************
    // Setup Express
    // *************************************************

    app = Express();

    app.use(cors({ exposedHeaders: 'Authorization' }));
    app.use(Express.urlencoded({ extended: true }));
    app.use(Express.json());

    // *************************************************
    // Decode jwt, if any
    // *************************************************

    app.use(function JWTDecoderMiddleware(req: Express.Request, res: Express.Response, next: Express.NextFunction) {

        const authorization = req.headers.authorization;
        if (authorization && authorization.startsWith("Bearer ")) {
            const u = DecodeJWT(authorization.substring(7));
            if (u)
                req.User = u;
            else
                console.log("jwt found, but it was not valid.");
        }

        next();
    });

    // *************************************************
    // Routes
    // *************************************************

    app.get('/', function (_req: Express.Request, res: Express.Response) {
        res.status(200).json({
            "Foo": "Bar",
            "Time": new Date().toISOString()
        });
    });

    app.get('/ping', function (_req: Express.Request, res: TypedResponse<{ Pong: string }>) {
        res.status(200).json({ Pong: new Date().toISOString() });
    });


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

    // *************************************************
    // With function HasAccessLevel
    // *************************************************

    app.get('/me', function (req: Express.Request, res: TypedResponse<{ UserName: string }>) {

        if (!HasAccessLevel(req, res, ["User", "Admin"]))   // Both a user and Admin can reach this
            return;

        res.status(200).json({ "UserName": req.User.Name });

    });

    // *************************************************
    // With middleware HasAccessLevel
    // *************************************************

    app.get('/me2',
        (rq, rs, n) => HasAccessLevelMiddleware(rq, rs, n, ["User", "Admin"]), // Both a user and Admin can reach this
        (req: Express.Request, res: TypedResponse<{ UserName: string }>) => {

            res.status(200).json({ "UserName": req.User.Name });

        });

    // *************************************************
    // Admin test
    // *************************************************

    app.get('/admin/test', function (req: Express.Request, res: TypedResponse<{ Success: boolean }>) {

        if (!HasAccessLevel(req, res, ["Admin"]))   // Only Admin can reach this
            return;

        res.status(200).json({ Success: true });

    });

    // *************************************************
    // Add 404 handler
    // *************************************************

    app.use(function (_req: Express.Request, res: Express.Response) {
        res.status(404).json({ Error: "This route is not found" });
    });


    // *************************************************
    // Error handler
    // *************************************************

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use(function (err: Error & { status: number, message: string }, req: Express.Request, res: Express.Response, next: Express.NextFunction) {
        console.error(err.status);
        console.error(err.message);
        console.error(err.stack);
        res.status(500).json({ Error: "Internal error" });
        res.end();
    });

    // *************************************************
    // Start server
    // *************************************************

    http.createServer(app).listen(PORT, () => console.log(`Webserver running at http://localhost:${PORT}/`));

    return app;
}


export function PrintRoutes(app: Express.Application): void {

    console.log("*** Printing routes.");

    const router: Express.Router = app._router;
    const routes = router.stack.filter(s => s.route !== undefined).map(r => r.route);
    const routes2 = routes.map(r => ({
        path: r.path,
        method: Object.keys(r.methods).join(", ").toUpperCase()
    }));
    routes2.sort((a, b) => a.path.localeCompare(b.path));

    // Print it in compact form
    const processed: string[] = [];
    for (const route of routes2) {
        if (!processed.find(p => p === route.path)) {
            const all = routes2.filter(r => r.path === route.path).map(r => r.method);
            console.debug(`${all.join("|")} ${route.path}`);
            processed.push(route.path);
        }
    }
}


export function HasAccessLevel(req: Express.Request, res: Express.Response, iRequiredAccessLevels: AccessLevel[] = []): boolean {

    let result = false;
    if (req.User)
        result = iRequiredAccessLevels.includes(req.User.AccessLevel);
    else
        result = iRequiredAccessLevels.includes("Anonymous");

    if (!result) {
        res.status(401).json({ Success: false, Error: "Access denied" });
        res.end();
    }

    return result;
}



export function HasAccessLevelMiddleware(req: Express.Request, res: Express.Response, next: Express.NextFunction, iRequiredAccessLevels: AccessLevel[] = []): void {

    let hasAccess = false;
    if (req.User)
        hasAccess = iRequiredAccessLevels.includes(req.User.AccessLevel);
    else
        hasAccess = iRequiredAccessLevels.includes("Anonymous");

    if (hasAccess)
        next();
    else {
        res.status(401).json({ Success: false, Error: "Access denied" });
        res.end();
    }
}

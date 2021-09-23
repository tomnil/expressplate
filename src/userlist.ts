import { User } from "./types";
import * as jwthelper from './jwthelper';
import { Bearer } from './types';

const Users: User[] = [
    {
        ID: "root",
        Name: "root",
        AccessLevel: "Admin",
        /** Never ever do this. */
        Password: "Banana1"
    },
    {
        ID: "foo",
        Name: "Foo",
        AccessLevel: "User",
        /** Never ever do this. */
        Password: "Bar"
    }

];


export function Login(arg: { username: string, password: string }): string | undefined {

    const user = Users.find(u => u.Name === arg.username && u.Password === arg.password);
    if (user) {

        const result: Bearer = {
            ID: user.ID,
            Name: user.Name,
            AccessLevel: user.AccessLevel
        };

        const jwt = jwthelper.Encode(result);

        return jwt;
    }

}

export function DecodeJWT(jwt: string): User | undefined {

    const decoded = jwthelper.Decode<Bearer>(jwt);
    if (decoded)
        return Users.find(u => u.ID === decoded.ID);
}

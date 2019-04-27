import { PictureResponse } from './facebook.dto';

export class FacebookToken {
    public value: string;
    public expiresIn: number;
    public reauthorizeRequestIn?: number;
}

export class FacebookUser {
    public id: string;
    public scopes?: string;
    public token: FacebookToken;
    private signedRequest: string;

    constructor(response: fb.AuthResponse) {
        this.id = response.userID;
        this.scopes = response.grantedScopes;
        this.signedRequest = response.signedRequest;

        this.token = {
            value: response.accessToken,
            expiresIn: response.expiresIn,
            reauthorizeRequestIn: response.reauthorize_required_in
        };
    }
}

export class FacebookUserPicture {
    height: number;
    width: number;
    url: string;

    constructor(response: PictureResponse) {
        this.height = response.data.height;
        this.width = response.data.width;
        this.url = response.data.url;
    }
}

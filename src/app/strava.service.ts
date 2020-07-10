import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Token } from './token';
import { Activity } from './activity';

@Injectable({
  providedIn: 'root'
})
export class StravaService {

  constructor(private http: HttpClient) { }

  getAccessToken(code: string) {
    return this.http.post<Token>(`https://www.strava.com/oauth/token?client_id=7251&client_secret=b3e9549ce42000f51582613562e36f1009a7420e&code=${code}&grant_type=authorization_code`, {});
  }

  getActivities(accessToken: string) {
    return this.http.get<Activity[]>(
      'https://www.strava.com/api/v3/athlete/activities?page=1&per_page=30',
      { headers: new HttpHeaders().set('Authorization',  `Bearer ${accessToken}`) }
    );
  }
}

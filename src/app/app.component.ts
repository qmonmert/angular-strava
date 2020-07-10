import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { environment } from './../environments/environment';
import { Token } from './token';
import { StravaService } from './strava.service';
import { Activity } from './activity';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  STRAVA_TOKEN = 'stravaToken';

  firstDayWeek: Date;
  lastActivity: Activity;
  weekActivities: Activity[] = [];

  constructor(private stravaService: StravaService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.firstDayWeek = this.startOfWeek(new Date());

    const localToken = localStorage.getItem(this.STRAVA_TOKEN);

    const url = new URLSearchParams(window.location.href);
    const code = url.get('code');

    if (localToken) {
      this.stravaService.getActivities(localToken).subscribe(activities => {
        this.setData(activities);
      },
      () => {
        localStorage.removeItem(this.STRAVA_TOKEN);
        this.redirectAuthStrava();
      });
    } else if (code) {
      this.stravaService.getAccessToken(code).pipe(
        switchMap((token: Token) => {
          localStorage.setItem(this.STRAVA_TOKEN, token.access_token);
          return this.stravaService.getActivities(token.access_token);
        })
      ).subscribe(activities => {
        this.setData(activities);
      });
    } else {
      this.redirectAuthStrava();
    }
  }

  displayDay(activity: Activity): string {
    const day = (new Date(activity.start_date)).getDay();
    if (day === 1) {
      return 'Lundi';
    } else if (day === 2) {
      return 'Mardi';
    } else if (day === 3) {
      return 'Mercredi';
    } else if (day === 4) {
      return 'Jeudi';
    } else if (day === 5) {
      return 'Vendredi';
    } else if (day === 6) {
      return 'Samedi';
    } else if (day === 7) {
      return 'Dimanche';
    }
  }

  displayType(activity: Activity): string {
    if (activity.type === 'Swim') {
      return 'Natation';
    } else if (activity.type === 'VirtualRide') {
      return 'Home trainer';
    } else if (activity.type === 'Run') {
      return 'Course à pied';
    } else if (activity.type === 'Ride') {
      return 'Vélo';
    } else if (activity.type === 'WeightTraining') {
      return 'Musculation';
    } else {
      return 'Autre';
    }
  }

  private redirectAuthStrava(): void {
    if (environment.production) {
      window.location.href = 'https://www.strava.com/oauth/authorize?client_id=7251&redirect_uri=https://angular-strava-53a6b.firebaseapp.com&response_type=code&scope=activity:read';
    } else {
      window.location.href = 'https://www.strava.com/oauth/authorize?client_id=7251&redirect_uri=http://localhost:4200&response_type=code&scope=activity:read';
    }
  }

  private setData(activities: Activity[]): void {
    this.lastActivity = activities[0];
    activities.forEach((activity: Activity) => {
      const activityDate = new Date(activity.start_date);
      if (activityDate > this.firstDayWeek) {
        this.weekActivities.push(activity);
      }
    });
  }

  private startOfWeek(date): Date {
    const diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
    const d = new Date(date.setDate(diff));
    d.setHours(0, 0, 0, 0);
    return d;
  }
}

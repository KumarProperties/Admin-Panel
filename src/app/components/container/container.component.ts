import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss'],
})
export class ContainerComponent implements OnInit {
  active = false;
  currentIndex = 0;
  heading = '';
  devTool = false;
  constructor(private router: Router, public state: CommonService) {}

  ngOnInit(): void {
    if (!this.state.isAuthenticated()) {
      this.state.logout();
    }

    this.initialSelectMenu();
  }

  devtools() {
    this.devTool = true;
    this.sidebarList.push();
  }

  sidebarList = [
    {
      label: 'Event',
      route: '/dashboard/activity/EVENT',
      active: false,
      hide: false,
    },
    {
      label: 'Exhibition',
      route: '/dashboard/activity/EXHIBITION',
      active: false,
      hide: false,
    },
    {
      label: 'CSR_Activies',
      route: '/dashboard/activity/CSR_ACTIVITY',
      active: false,
      hide: false,
    },
    {
      label: 'Blogs',
      route: '/dashboard/blogs',
      active: false,
      hide: false,
    },
    {
      label: 'Projects',
      route: '/dashboard/projects',
      active: false,
      hide: false,
    },

    {
      label: 'Testimonials',
      route: '/dashboard/testimonials',
      active: false,
      hide: false,
    },
    {
      label: 'Trending Projects',
      route: '/dashboard/trending',
      active: false,
      hide: false,
    },
  ];

  initialSelectMenu() {
    let routeIndex = this.sidebarList.findIndex(
      (e) => e.route == window.location.pathname
    );
    this.selectMenu(~routeIndex ? routeIndex : 0);
  }

  selectMenu(index: number) {
    if (this.currentIndex > -1) {
      this.sidebarList[this.currentIndex].active = false;
    }
    this.currentIndex = index;

    this.sidebarList[index].active = true;
    this.heading = this.sidebarList[index].label;
    this.router.navigate([this.sidebarList[this.currentIndex].route]);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }
}

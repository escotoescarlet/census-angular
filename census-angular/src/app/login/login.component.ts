import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MessagesComponent } from '../messages/messages.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StorageService } from '../storage.service';
import { ServiceService } from '../service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    MessagesComponent,
    TranslateModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  public loginForm!: FormGroup;
  public errorMsg: string = '';
  public showErrorToast: boolean = false;

  public messageInfo: string = '';
  public typeMessage: string = '';
  public showMsg: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private translate: TranslateService,
    private storageService: StorageService,
    private service: ServiceService) {
      this.setLanguage();
  }

  ngOnInit(): void {
    this.logout();

    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  setLanguage() {
    this.translate.addLangs(['en', 'es']);

    const savedLang = typeof window !== 'undefined' && localStorage.getItem('selectedLang') || 'en';
    this.changeLanguage(savedLang);
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('selectedLang', lang);
    }
  }

  logout(): void {
    this.storageService.clear();
    this.router.navigate(['/login']);
  }

  goToSite() {
    this.router.navigate(['']);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.showErrorToast = true;

      let credentials: any = {
        email: this.loginForm.value.username,
        password: this.loginForm.value.password,
        remember_me: this.loginForm.value.rememberMe ? 1 : 0
      };

      this.service.login(credentials).subscribe(
        (data: any) => {
          this.setSession(data);
          this.router.navigate(['/main/dashboard']);
        }, (error: any) => {
          this.showErrorMsg(error);
        }
      )
    }
  }

  setSession(data: any) {
    this.storageService.setItem('auth_token', data.token);
    this.storageService.setItem('_user', data.user);
  }

  showErrorMsg(error: any) {
    this.messageInfo = error.error.message;
    this.typeMessage = "ERROR";
    this.showMsg = true;
    this.loginForm.reset();

    setTimeout(() => {
      this.showMsg = false;
    }, 5000);
  }
}

import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/neon-animation/neon-animation.js';
import '@polymer/paper-spinner/paper-spinner.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/communication-icons.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/iron-a11y-keys/iron-a11y-keys.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { AppLocalizeBehavior } from '@polymer/app-localize-behavior/app-localize-behavior.js';

class NcPasswordDialog extends mixinBehaviors([AppLocalizeBehavior], PolymerElement) {
  static get template() {
    return html`
      <style>
      </style>
      
      <paper-dialog id="passwordDialog" class="modalNoApp" modal dialog>
        <iron-a11y-keys id="a11ySignIn" keys="enter" on-keys-pressed="_accept"></iron-a11y-keys>
        <div class="header">
          <iron-icon icon="communication:vpn-key"></iron-icon><h3>{{localize('PASSWORD_DIALOG_TITLE')}}</h3>
        </div>
        <div class="content">
          <paper-input id="password"  type="password" error-message="{{localize('INPUT_ERROR_REQUIRED')}}" value="{{formData.password}}" on-focus="_setFocus" on-blur="_setBlur" required></paper-input>
        </div>
        <div class="buttons">
          <div hidden\$="{{!loading}}">
            <paper-spinner class="dialog" active></paper-spinner>
          </div>
          <paper-button raised dialog-dismiss disabled\$="[[loading]]">{{localize('BUTTON_CLOSE')}}</paper-button>
          <paper-button raised disabled\$="[[loading]]" on-tap="_accept">{{localize('BUTTON_ACCEPT')}}</paper-button>
        </div>
      </paper-dialog>
    `;
  }

  static get properties() {
    return {
      language: {
        type: String
      },
      formData: {
        type: Object
      },
      userData: {
        type: Object,
        value: {}
      },
      loading: {
        type: Boolean,
        value: false
      }
    };
  }

  static get importMeta() { 
    return import.meta; 
  }

  connectedCallback() {
    super.connectedCallback();
    this.useKeyIfMissing = true;
    this.loadResources(this.resolveUrl('./static/translations.json'));
  }

  open(){
    /* Fix Modal paper-dialog appears behind its backdrop */
    var app = document.querySelector('body').firstElementChild.shadowRoot;
    dom(app).appendChild(this.$.passwordDialog);
    
    this.formData = {};
    this.$.password.invalid = false;
    this.$.passwordDialog.open();

    this._setFocusDebouncer = Debouncer.debounce(this._setFocusDebouncer,
      timeOut.after(500),
      () => this.$.password.focus()
    );
  }

  _accept(){
    if (this.$.password.validate()) {
      this.dispatchEvent(new CustomEvent('password-accepted', {detail: {user: this.userData, password: this.formData.password}, bubbles: true, composed: true }));
      this.$.passwordDialog.close();
    } else{
      this.$.password.focus();
    }
  }

  _setFocus(){
    this.dispatchEvent(new CustomEvent('inputFocus', {bubbles: true, composed: true }));
  }

  _setBlur(){
    this._debouncer = Debouncer.debounce(this._debouncer,
      timeOut.after(500),
      () => this.dispatchEvent(new CustomEvent('inputBlur', {bubbles: true, composed: true }))
    );
  }
}

window.customElements.define('nc-password-dialog', NcPasswordDialog);

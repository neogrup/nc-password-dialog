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
import '@neogrup/nc-keyboard/nc-keyboard.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { AppLocalizeBehavior } from '@polymer/app-localize-behavior/app-localize-behavior.js';

class NcPasswordDialog extends mixinBehaviors([AppLocalizeBehavior], PolymerElement) {
  static get template() {
    return html`
      <style>
        paper-dialog.modalNoApp {
          width: 95%;
        }

        @media (min-width: 1660px) {
          paper-dialog {
            max-width: 1460px;
          }
        }

        .content{
          margin-top: 0px;
        }

        paper-button.delete:not([disabled]){
          background-color: var(--error-color);
        }

        paper-button.accept:not([disabled]){
          background-color: var(--success-color);
        }
      </style>
      
      <paper-dialog id="passwordDialog" class="modalNoApp fullWidth" modal dialog>
        <iron-a11y-keys id="a11ySignIn" keys="enter" on-keys-pressed="_accept"></iron-a11y-keys>
        <div class="header">
          <iron-icon icon="communication:vpn-key"></iron-icon><h3>{{localize(dialogTitle)}}</h3>
        </div>
        <div class="content">
          <div>
            <paper-input id="password"  type="password" error-message="{{localize('INPUT_ERROR_REQUIRED')}}" value="{{formData.password}}" on-focus="_setFocus" on-blur="_setBlur" required></paper-input>
          </div>
          <div style="margin-top:15px;">
            <paper-checkbox checked="{{showPassword}}" on-change="_toggleVisibility">{{localize('CHECKBOX_SHOW_PASSWORD')}}</paper-checkbox>
          </div>
        </div>
        <div class="content-keyboard">
          <nc-keyboard
            keyboard-enabled="{{showKeyboard}}"
            keyboard-embedded='S'
            keyboard-type="keyboard"
            value="{{formData.password}}"
            keyboard-current-input="{{keyboardCurrentInput}}">
          </nc-keyboard>
        </div>
        <div class="buttons">
          <div hidden\$="{{!loading}}">
            <paper-spinner class="dialog" active></paper-spinner>
          </div>
          <paper-button raised class="delete" dialog-dismiss disabled\$="[[loading]]">{{localize('BUTTON_CLOSE')}}</paper-button>
          <paper-button raised class="accept" disabled\$="[[loading]]" on-tap="_accept">{{localize('BUTTON_ACCEPT')}}</paper-button>
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
      },
      dialogTitle: {
        type: String,
        value: ''
      },
      dialogOrigin: String,
      showKeyboard: {
        type: String,
      },
      keyboardCurrentInput: {
        type: Object
      },
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
    
    if (this.dialogTitle == '') {
      this.dialogTitle = 'PASSWORD_DIALOG_TITLE';
    }

    this.formData = {};
    this.$.password.invalid = false;
    this.showPassword = false;
    this.$.passwordDialog.open();
    this.keyboardCurrentInput = this.$.password;
    this.keyboardCurrentInput.setAttribute('type', 'password');

    this._setFocusDebouncer = Debouncer.debounce(this._setFocusDebouncer,
      timeOut.after(500),
      () => this.$.password.focus()
    );
  }

  _accept(){
    if (this.$.password.validate()) {
      this.$.passwordDialog.close();
      this.dispatchEvent(new CustomEvent('password-accepted', {detail: {user: this.userData, password: this.formData.password, dialogOrigin: this.dialogOrigin}, bubbles: true, composed: true }));
    } else{
      this.$.password.focus();
    }
  }

  _setFocus(){
    this.keyboardCurrentInput = this.$.password;
    this.dispatchEvent(new CustomEvent('inputFocus', {bubbles: true, composed: true }));
  }

  _setBlur(){
    this._debouncer = Debouncer.debounce(this._debouncer,
      timeOut.after(500),
      () => this.dispatchEvent(new CustomEvent('inputBlur', {bubbles: true, composed: true }))
    );
  }

  _toggleVisibility(){
    this.keyboardCurrentInput = this.$.password;
    let fieldType = this.keyboardCurrentInput.getAttribute('type') === 'password' ? 'text' : 'password';
    this.keyboardCurrentInput.setAttribute('type', fieldType);
  }
}

window.customElements.define('nc-password-dialog', NcPasswordDialog);

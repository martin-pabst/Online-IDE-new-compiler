import jQuery from 'jquery';
import { ajaxAsync } from '../communication/AjaxHelper';

type RegisterSchoolAdminAccountRequest = {
    username: string;
    password: string;
    rufname: string;
    familienname: string;
    mail: string;

    oneTimeKey: string;

    onlyTest: boolean;
}

type RegisterSchoolAdminAccountResponse = {
    success: boolean;
    message: string;
}

class RegisterSchoolAdmin {

    step: 'stepone' | 'steptwo' | 'stepsuccess' = 'stepone';
    onetimekey: string | null = null;

    start() {
        this.showStep('stepone');
        jQuery('#nextbutton').on('click', () => {
            switch (this.step) {
                case 'stepone':
                    this.nextAfterStepOne();
                    break;
                case 'steptwo':
                    this.nextAfterStepTwo();
                    break;
            }
        });
    }

    showStep(step: 'stepone' | 'steptwo' | 'stepsuccess') {
        this.step = step;
        this.showError('');
        jQuery('.step').hide();
        jQuery('#' + step).show();
    }

    async nextAfterStepOne() {
        this.onetimekey = jQuery('#onetimekey').val()?.toString() || null;
        if (this.onetimekey == null || this.onetimekey.toString().trim() == '') {
            this.showError('Bitte geben Sie den Einmal-Schlüssel Ihrer Schule ein.');
            return;
        }

        const request: RegisterSchoolAdminAccountRequest = {
            username: null,
            password: null,
            rufname: null,
            familienname: null,
            mail: null,
            oneTimeKey: this.onetimekey,
            onlyTest: true
        };

        const response: RegisterSchoolAdminAccountResponse = await ajaxAsync('servlet/registerSchoolAdminAccount', request);
        if (response.success) {
            this.showStep('steptwo');
        } else {
            this.showError(response.message);
        }
    }


    async nextAfterStepTwo() {

        const request: RegisterSchoolAdminAccountRequest = {
            username: jQuery('#username').val()?.toString() || null,
            password: jQuery('#password').val()?.toString() || null,
            rufname: jQuery('#rufname').val()?.toString() || null,
            familienname: jQuery('#familienname').val()?.toString() || null,
            mail: jQuery('#mail').val()?.toString() || null,
            oneTimeKey: this.onetimekey,
            onlyTest: false
        };

        const response: RegisterSchoolAdminAccountResponse = await ajaxAsync('servlet/registerSchoolAdminAccount', request);
        if (response.success) {
            jQuery('#nextbutton').hide();
            this.showStep('stepsuccess');
        } else {
            this.showError(response.message);
        }
    }

    showError(message: string) {
        jQuery('#errordiv').text(message);
        jQuery('#errordiv').show();
    }

}

window.onload = () => {
    new RegisterSchoolAdmin().start();
}
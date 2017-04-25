import Errors from './Errors';
import axios from 'axios';

export default class Form {
    constructor(data) {
        this.originalData = data;
        for (let field in data) {
            this[field] = data[field];
        }
        this.errors = new Errors();
    }

    getData() {
        let data = Object.assign({}, this);
        delete data.originalData;
        delete data.errors;
        return data;
    }

    submit(url, params) {
        let data = this.getData();
        if (params) {
            data = {params: params, data: data};
        }
        return new Promise((resolve, reject) => {
            axios.post(url, data)
                .then(response => {
                    this.onSuccess(response.data);
                    resolve(response.data);
                })
                .catch(error => {
                    this.onFail(error.response.data);
                    reject(error.response.data);
                });
        });
    }

    onSuccess(data) {
        this.reset();
    }

    onFail(errors) {
        this.errors.record(errors);
    }

    reset() {
        for (let field in this.originalData) {
            this[field] = '';
        }
        this.errors.clear();
    }
}
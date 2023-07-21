
import { getBackendSrv } from '@grafana/runtime';

const API_RESOURCES = '/api/plugins/sensetif-datasource/resources/';

export type project = {
    name: string;
    title: string;
}

export type subsystem = {
    name: string;
    title: string;
}

export type datapoint = {
    name: string;
    title: string;
}

export type aggregation = {
    name: string;
    title: string;
}

export const request = (path: string, method: string, body: string, waitTime = 0) => {
    let srv = getBackendSrv();
    let request: Promise<any>;
    switch (method) {
        case 'GET':
            request = srv.get(API_RESOURCES + path, body);
            break;
        case 'PUT':
            request = srv.put(API_RESOURCES + path, body);
            break;
        case 'POST':
            request = srv.post(API_RESOURCES + path, body);
            break;
        case 'DELETE':
            request = srv.delete(API_RESOURCES + path);
            break;
    }
    return new Promise<any>((resolve, reject) => {
        request
            .then((r) =>
                setTimeout(() => {
                    resolve(r);
                }, waitTime)
            )
            .catch((err) => {
                reject(err);
            });
    });
};

export const loadProjects = (): Promise<project[]> =>
    request('_', 'GET', '', 0);

export const loadSubsystems = (projectName: string): Promise<subsystem[]> =>
    request(projectName + '/_', 'GET', '', 0);

export const loadDatapoints = (projectName: string, subsystemName: string): Promise<datapoint[]> =>
    request(projectName + '/' + subsystemName + '/_', 'GET', '', 0);



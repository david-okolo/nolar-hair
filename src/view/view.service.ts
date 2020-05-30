import { Injectable, OnModuleInit } from '@nestjs/common';
import { readdir, readFileSync } from 'fs';

@Injectable()
export class ViewService implements OnModuleInit {
    private views: object = {};

    onModuleInit() {
        readdir('views', 'utf-8', (err, files) => {
            files.forEach((value) => {
                const [name, extension] = value.split('.');
                if(extension === 'html') {
                    this.views[name] = readFileSync(`views/${value}`, 'utf-8');
                }
            })
        });
    }

    get(viewName: string) {
        return this.views[viewName];
    }
}

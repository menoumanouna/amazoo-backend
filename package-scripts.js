require('dotenv').config();

const npsUtils = require('nps-utils');

const {rimraf, crossEnv, series, concurrent, ifNotWindows} = npsUtils;

const NODEMON_CMD =
    'nodemon --watch .env --watch dev --delay 5 --icu-data-dir=node_modules/full-icu';

module.exports = {
    scripts: {
        start: {
            default: {
                description: 'Running on dev environment with debug off.',
                script: concurrent.nps('start.watch', 'start.run')
            },
            debug: {
                description: 'Running on dev environment with debug on.',
                script: concurrent.nps('start.watch', 'start.run.debug')
            },
            run: {
                default: `${crossEnv(
                    'NODE_ENV=development'
                )} ${NODEMON_CMD} dev/index.bundle.js`,
                debug: `${crossEnv(
                    'NODE_ENV=development'
                )} ${NODEMON_CMD} --inspect dev/index.bundle.js`
            },
            watch: {
                description: 'Webpack watch for change and compile.',
                script: `${crossEnv('NODE_ENV=development')} webpack -w --progress`
            }
        },
        db: {
            up: {
                default: {
                    description: 'Database migration up',
                    script: 'sequelize db:migrate'
                },
                debug: {
                    description: 'Database migration up with debug on',
                    script: `${crossEnv('DEBUG=sequelize:sql:*')} sequelize db:migrate`
                }
            },
            seed: {
                default: {
                    description: 'Database seed all',
                    script: 'sequelize db:seed:all'
                },
                init: {
                    seed: {
                        description: 'Database seed initialization: create storage table',
                        script: 'sequelize db:seed --seed _init.js'
                    },
                    undo: {
                        description: 'Database seed initialization: remove unused line',
                        script: 'sequelize db:seed:undo --seed _init.js'
                    },
                    default: {
                        description: 'Database seed initialization',
                        script: series.nps('db.seed.init.seed', 'db.seed.init.undo')
                    }
                },
                debug: {
                    description: 'Database seed all with debug on',
                    script: `${crossEnv('DEBUG=sequelize:sql:*')} sequelize db:seed:all`
                }
            },
        },
    }
};

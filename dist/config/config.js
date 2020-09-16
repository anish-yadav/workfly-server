var env = process.env.NODE_ENV || 'development';
var config = require('./config.json');
console.log(env);
if (env === 'development' || env === 'test') {
    var envConfig = config[env];
    Object.keys(envConfig).forEach((key) => {
        process.env[key] = envConfig[key];
    });
}
//# sourceMappingURL=config.js.map
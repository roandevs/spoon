module.exports = {
    database: {
        username: 'rsakeys',
        password: '',
        mainName: 'spoon',
        mailName: 'vmail'
    },
    mailserverDomain: 'mailserver.rsakeys.org',
    webDomain: 'spoon.pw',
    emailDomain: 'spoon.pw',
    whitelistedAdmins: [
        '',
        '',
    ],
    spoonDir: '/mnt/hdd/spoon/',
    webTokenSecret: '', /* secret key for jwt auth */
    iv: "", /* secret key for encrypted passwords for imap/nodemailer sessions */
    ports: {
        imapWss: 3728,
        cloudHttpApi: 3291
    }
}

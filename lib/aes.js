const path = require('path')
const chalk = require('chalk')
var CryptoJS = require("crypto-js");
const fs = require('fs')
const inquirer = require('inquirer')
const cwd = process.cwd()
const config = require('../config')
let {modes, paddings, aes} = config
const {cipher, iv, mode, padding} = aes
paddings = paddings.filter(item => item !== 'Pkcs5')

module.exports = (list, arg, type) => {
    let {i, m, p, e = 'utf8', o = 'hex', output, s, f} = arg
    if (i === true || s === true || e === true || o === true || f === true) {
        console.log(chalk.red('请输入正确的输入项！'))
        process.exit(1)
    }
    const option = []
    if (!f) option.push({
        type: 'list',
        name: 'file',
        message: '请选择需要加密的文件',
        choices: list,
    })
    if (!m) option.push({
        type: 'list',
        name: 'mode',
        message: '请选择加密模式',
        choices: modes,
        default: mode,
    })
    if (!p) option.push({
        type: 'list',
        name: 'padding',
        message: '请选择填充类型',
        choices: paddings,
        default: padding,
    })
    if (!s) option.push({
        type: 'input',
        name: 'cipher',
        message: '请输入加密密钥',
        default: cipher,
    })
    if (!i) option.push({
        type: 'input',
        name: 'iv',
        message: '请输入加密偏移量',
        default: iv,
    })


    inquirer.prompt(option).then(answers => {
        let {file = f, mode = m, padding = p, cipher = s || '', iv = i || ''} = answers
        if (cipher.length !== 16) {
            console.log(chalk.red('密钥长度要等与16！'))
            process.exit(1)
        }
        if (mode === 'CBC' && (cipher.length !== 16 || iv.length !== 16)) {
            console.log(chalk.red('密钥或者偏移量长度要等与16！'))
            process.exit(1)
        }
        if (modes.indexOf(mode) === -1 || paddings.indexOf(padding) === -1) {
            console.log(chalk.red('加密方式或者填充方式错误！'))
            process.exit(1)
        }
        const filePath = path.join(cwd, file)

        fs.readFile(filePath, e === "buffer" ? "" : e, function (err, data) {
            if (err) {
                console.log(chalk.red(err))
                process.exit(1)
                return
            }
            if (type) {
                if (o !== 'base64') data = Buffer.from(data, 'hex').toString('base64')
                let decrypt = CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse(cipher), {
                    iv: CryptoJS.enc.Utf8.parse(iv),
                    mode: CryptoJS.mode[mode],
                    padding: CryptoJS.pad[padding]
                });
                const encrypted = decrypt.toString(CryptoJS.enc.Utf8).toString()
                console.log(chalk.green(encrypted))
                if (output) {
                    fs.writeFile(output !== true ? path.join(cwd, output) : path.join(path.dirname(filePath), `unAes.${path.basename(filePath)}`), encrypted, 'utf8', (err) => {
                        if (err) {
                            console.log(chalk.red(err))
                            process.exit(1)
                            return
                        }
                    });
                }
                return
            }
            const decrypt = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(cipher), {
                iv: CryptoJS.enc.Utf8.parse(iv),
                mode: CryptoJS.mode[mode],
                padding: CryptoJS.pad[padding]
            });
            let encrypted = decrypt.ciphertext.toString()
            if (o === 'base64') encrypted = Buffer.from(encrypted, 'hex').toString('base64')
            console.log(chalk.green(encrypted))
            let newConfig = {
                ...config, ...{
                    aes: {
                        padding,
                        mode,
                        cipher,
                        iv
                    }
                }
            }
            fs.writeFile(path.join(__dirname, '../config.json'), JSON.stringify(newConfig, '', '\t'), 'utf8', () => {
            })
            if (output) {
                fs.writeFile(output !== true ? path.join(cwd, output) : path.join(path.dirname(filePath), `aes.${path.basename(filePath)}`), encrypted, 'utf8', (err) => {
                    if (err) {
                        console.log(chalk.red(err))
                        process.exit(1)
                        return
                    }
                });
            }

        });
    })
}

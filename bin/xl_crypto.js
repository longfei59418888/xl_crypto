#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const argv = require('yargs').argv
const program = require('commander')
const shell = require('shelljs')
const glob = require("glob");
const aes = require('../lib/aes.js')
const md5 = require('../lib/md5.js')
const rsa = require('../lib/rsa.js')
// 如果存在本地的命令，执行本地的
try {
    var localWebpack = require.resolve(path.join(process.cwd(), "node_modules", "xl_crypto", "bin", "xl_crypto.js"));
    if (__filename !== localWebpack) {
        return require(localWebpack);
    }
} catch (e) {
}

const package = JSON.parse(shell.cat(path.join(__dirname, '../package.json')))
const cwd = process.cwd()

let list = glob.sync(path.join(cwd, '*'), {}) || [];
list = list.filter(item => fs.statSync(item).isFile())
list = list.map(item => path.basename(item))

program
    .version(package.version)
    .usage('[cmd] [options]')
    .option('-f', '[aes]文件相对路径，空为当前目录列表(不设置会在当前目录选择)')
    .option('-i', '[aes]偏移量，默认:""')
    .option('-m', '[aes]加密模式类型，默认: ECB')
    .option('-p', '[aes]加密的填充方式类型，默认: Pkcs7')
    .option('-e', '[aes]数据输入的编码类型(buffer/utf8/base64/hex)')
    .option('-o', '[aes]数据输出的编码类型(buffer/utf8/base64/hex)')
    .option('--output', '[aes]输出文件的相对路径,默认: [aes].pathName')
    .option('--pub', '[rsa]公钥相对路径(不设置会在当前目录选择) [un]rsa --pub 或者 rsa --pub path')
    .option('--pri', '[rsa]私钥相对路径(不设置会在当前目录选择) [un]rsa --pri 或者 rsa --pri path')
    .option('-s', '[aes]加密时候的密文(密钥)，默认:""')
program
    .command('aes')
    .description('对文件内容进行加密，数据块：128位，需要(偏移量/输入输出编码/密钥/加密模式/填充方式)\n' +
        '默认输入数据编码为：utf8，输出为：hex')
    .action((path, options) => {
        aes(list, argv)
    })
program
    .command('unAes')
    .description('对文件内容进行解密，数据块：128位，需要(偏移量/输入输出编码/密钥/加密模式/填充方式)\n' +
        '默认输入数据编码为：hex，输出为：utf8')
    .action((path, options) => {
        aes(list, argv, true)
    })
program
    .command('md5')
    .description('对文件内容进行md5加密')
    .action((path, options) => {
        md5(list, argv)
    })
program
    .command('rsa')
    .description('对文件内容进行md5加密')
    .action((path, options) => {
        rsa(list, argv)
    })
program
    .command('unRsa')
    .description('对文件内容进行md5加密')
    .action((path, options) => {
        rsa(list, argv, true)
    })

program.parse(process.argv)

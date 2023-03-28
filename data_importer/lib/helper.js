import { customAlphabet } from 'nanoid';
export function createId(useCase, length = 6) {
    //  we use a character set w/out lookalike characters
    // e.g. 1, l, I, 0, O, o, u, v, 5, S, s, 2, Z
    // https://github.com/CyberAP/nanoid-dictionary#nolookalikes
    const characterSet = '346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz';
    const nanoid = customAlphabet(characterSet, length);
    const id = nanoid();
    // if the use of this function is to create html ids, insure first character is a letter
    return useCase === 'html' && /^[^A-Za-z]/.test(id)
        ? createId(useCase, length)
        : id;
}
//# sourceMappingURL=helper.js.map
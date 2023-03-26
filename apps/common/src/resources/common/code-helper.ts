const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export class CodeHelper {
    static generateCode(length: number): string {
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }
}
module.exports = 
class Expenses{
    constructor(fullAmount, afterAmount, remainingAmount, userId)
    {
        this.Id = 0;
        this.FullAmount = fullAmount !== undefined ? fullAmount : 0;
        this.AfterAmount = afterAmount !== undefined ? afterAmount : 0;
        this.RemainingAmount = remainingAmount !== undefined ? remainingAmount : 0;
        this.UserId = userId !== undefined ? userId : 0;
    }

    static valid(instance) {
        const Validator = new require('./validator');
        let validator = new Validator();
        validator.addField('Id','integer');
        validator.addField('FullAmount','integer');
        validator.addField('AfterAmount','integer');
        validator.addField('RemainingAmount','integer');
        validator.addField('UserId', 'integer');
        return validator.test(instance);
    }
}
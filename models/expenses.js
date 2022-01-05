module.exports = 
class Expenses{
    constructor(name, value, description, userId)
    {
        this.Id = 0;
        this.Name = name !== undefined ? name : "";
        this.Value = value !== undefined ? value : "";
        this.Description = description !== undefined ? description : "";
        this.UserId = userId !== undefined ? userId : 0;
    }

    static valid(instance) {
        const Validator = new require('./validator');
        let validator = new Validator();
        validator.addField('Id','integer');
        validator.addField('Name','string');
        validator.addField('Value','string');
        validator.addField('Description','string');
        validator.addField('UserId', 'integer');
        return validator.test(instance);
    }
}
const Repository = require('../models/repository');
const Money = require('../models/money');
const Expenses = require('../models/expenses');
const util= require('util');

module.exports =
    class MoneyController extends require('./Controller') {
        constructor(req, res, params) {
            super(req, res, params, false /* needAuthorization */);
            this.bookmarksRepository = new Repository('Money', true /* cached */);
            this.expensesRepository = new Repository('Expenses', true /* cached */);
            this.bookmarksRepository.setBindExtraDataMethod(this.resolveUserName);
        }
        calculate(bookmark)
        {
            console.log("Array: "+ this.expensesRepository.findByFields('UserId', bookmark.UserId));
            const arrayOfExpenses=this.expensesRepository.findByFields('UserId', bookmark.UserId);
            if(arrayOfExpenses!=[])
            {
                let moneySpent=0;
                arrayOfExpenses.forEach(expense => {
                    moneySpent+=parseInt(expense.Value);
                });
                bookmark.RemainingAmount=bookmark.RemainingAmount-moneySpent;
                console.log("Gone Gone baby: "+moneySpent );
            }
            else
            {
                console.log("Nothing to calculate");
            }
            console.log("Moneys De base: "+util.inspect(this.bookmarksRepository.findByFields('UserId', bookmark),{showHidden: false, depth: null, colors: true}));
            console.log("---Moneys: "+util.inspect(this.expensesRepository.findByFields('UserId', bookmark),{showHidden: false, depth: null, colors: true}));
            return bookmark;
        }
        resolveUserName(bookmark) {
            let users = new Repository('Users');
            let user = users.get(bookmark.UserId);
            let username = "unknown";
            if (user !== null)
                username = user.Name;
            let bookmarkWithUsername = { ...bookmark };
            bookmarkWithUsername["Username"] = username;
            return bookmarkWithUsername;
        }

        head() {
            console.log("Money ETag request:", this.bookmarksRepository.ETag);
            this.response.ETag(this.bookmarksRepository.ETag);
        }

        // GET: api/bookmarks
        // GET: api/bookmarks?sort=key&key=value....
        // GET: api/bookmarks/{id}
        get(id) {
            if (this.params) {
                if (Object.keys(this.params).length > 0) {
                    this.response.JSON(this.bookmarksRepository.getAll(this.params), this.bookmarksRepository.ETag);
                } else {
                    this.queryStringHelp();
                }
            }
            else {
                if (!isNaN(id)) {
                    this.response.JSON(this.bookmarksRepository.get(id));
                }
                else {
                    this.response.JSON(this.bookmarksRepository.getAll(), this.bookmarksRepository.ETag);
                }
            }
        }
        post(bookmark) {
            if (this.requestActionAuthorized()) {
                // validate bookmark before insertion
                console.log("The unvalidated one: "+util.inspect(bookmark,{showHidden: false, depth: null, colors: true}));
                if (Money.valid(bookmark)) {
                    // avoid duplicate names
                    if (this.bookmarksRepository.findByField('UserId', bookmark.UserId) !== null) {
                        this.response.conflict();
                    } else {
                        let newBookmark = this.bookmarksRepository.add(this.calculate(bookmark));
                        console.log(this.bookmarksRepository.findByField('UserId', bookmark.UserId).FullAmount)
                        if (newBookmark)
                        {
                            this.response.created(newBookmark);
                        }
                        else
                            this.response.internalError();
                            console.log("nope");
                    }
                } else
                    this.response.unprocessable();
                    console.log("nope unprocess");
            } else
                this.response.unAuthorized();
                console.log("nope unauthorized");
        }
        // PUT: api/bookmarks body payload[{"Id":..., "Name": "...", "Url": "...", "Category": "...", "UserId": ..}]
        put(bookmark) {
            if (this.requestActionAuthorized()) {
                // validate bookmark before updating
                if (Money.valid(bookmark)) {
                    if (this.bookmarksRepository.update(this.calculate(bookmark)))
                        this.response.ok();
                    else
                        this.response.notFound();
                } else
                    this.response.unprocessable();
            } else
                this.response.unAuthorized();
        }
        // DELETE: api/bookmarks/{id}
        remove(id) {
            if (this.requestActionAuthorized()) {
                if (this.bookmarksRepository.remove(id))
                    this.response.accepted();
                else
                    this.response.notFound();
            } else
                this.response.unAuthorized();
        }
    }
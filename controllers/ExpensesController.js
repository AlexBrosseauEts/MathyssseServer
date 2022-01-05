const Repository = require('../models/repository');
const Expenses = require('../models/expenses');
const Money = require('../models/money');
const util= require('util');
module.exports =
    class ExpensesController extends require('./Controller') {
        constructor(req, res, params) {
            super(req, res, params, false /* needAuthorization */);
            this.bookmarksRepository = new Repository('Expenses', true /* cached */);
            this.moneyRepository = new Repository('Money', true /* cached */);
            this.bookmarksRepository.setBindExtraDataMethod(this.resolveUserName);
        }
        calculate(bookmark)
        {
            console.log("Array: "+ this.moneyRepository.findByFields('UserId', bookmark.UserId));
            const arrayOfExpenses=this.moneyRepository.findByFields('UserId', bookmark.UserId);
            if(arrayOfExpenses!="")
            {
                arrayOfExpenses[0].RemainingAmount=arrayOfExpenses[0].RemainingAmount-bookmark.Value;
                console.log("Gone Gone baby: "+arrayOfExpenses[0].RemainingAmount-bookmark.Value);
                this.moneyRepository.update(arrayOfExpenses[0]);
            }
            else
            {
                console.log("Nothing to calculate");
            }
            console.log("Moneys De base: "+util.inspect(this.bookmarksRepository.findByFields('UserId', bookmark),{showHidden: false, depth: null, colors: true}));
            console.log("---Moneys: "+util.inspect(this.moneyRepository.findByFields('UserId', bookmark),{showHidden: false, depth: null, colors: true}));
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
            console.log("Expenses ETag request:", this.bookmarksRepository.ETag);
            this.response.ETag(this.bookmarksRepository.ETag);
        }

        // GET: api/bookmarks
        // GET: api/bookmarks?sort=key&key=value....
        // GET: api/bookmarks/{id}
        get(id) {
            if (this.params) {
                if (Object.keys(this.params).length > 0) {
                    console.log("The params: "+ Object.keys(this.params).values);
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
                if (Expenses.valid(bookmark)) {
                    // avoid duplicate names
                    let expenseForIf=this.bookmarksRepository.findByField('Name', bookmark.Name);
                    if (expenseForIf !== null && expenseForIf.UserId == bookmark.UserId) {
                        this.response.conflict();
                    } else {
                        let newBookmark = this.bookmarksRepository.add(this.calculate(bookmark));
                        if (newBookmark)
                            this.response.created(newBookmark);
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
                if (Bookmark.valid(bookmark)) {
                    let foundBookmark = this.bookmarksRepository.findByField('Name', bookmark.Name);
                    if (foundBookmark != null) {
                        if (foundBookmark.Id != bookmark.Id) {
                            this.response.conflict();
                            return;
                        }
                    }
                    if (this.bookmarksRepository.update(bookmark))
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
define([
  'view',
  'templates/conversation-view',
  'views/comment-view',
  'views/comment-form',
  'views/change-votes',
  'views/metadataQuestionsView', // analyze view
  'views/results-view', //results view
  'models/vote',
  'models/participant',
  'models/conversation',
  'models/comment',
  'models/user',
  'collections/comments',
  'collections/votes',
  'collections/metadataQuestions',
  'collections/results',
  'app',
  'CommentShower',
  'FeedbackSubmitter',
  'LoginView',
  'p',
  'polisUtils',
  'util/polisStorage',
  'polis',
  'VisView'
  ], function (
    View, 
    template,
    CommentView, 
    CommentFormView,
    ChangeVotesView,
    MetadataQuestionsView,
    ResultsView,
    VoteModel,
    ParticipantModel,
    ConversationModel,
    CommentModel,
    UserModel,
    CommentsCollection,
    VotesCollection,
    MetadataQuestionsCollection,
    ResultsCollection,
    app, 
    CommentShower, 
    FeedbackSubmitter,
    LoginView,
    p,
    polisUtils,
    PolisStorage,
    ServerClient,
    VisView
    ) {
  return View.extend({
    name: 'conversation-view',
    template: template,
    events: {
    "click #topic_toggle": function(e) {
      e.preventDefault();
      this.$('#topic').toggle();
    },
    "click #react_tab": function(e) {
      e.preventDefault();
      console.dir(this);
      console.dir(e);
      $(e.target).tab('show');
    },
    "click #write_tab": function(e) {
      e.preventDefault();
      //$(this).tab('show')
      $(e.target).tab('show');
    },
  },
  onClusterTapped : function() {
      if (window.isMobile()) {
         window.scrollTo(0, $("#visualization_div").offset().top);
      }
  },
  initialize: function(){
    var that = this;
    var vis;
    var serverClient = new ServerClient({
      tokenStore: PolisStorage.token,
      emailStore: PolisStorage.email,
      usernameStore: PolisStorage.username,
      pidStore: PolisStorage.pids,
      uidStore: PolisStorage.uid,
      //commentsStore: PolisStorage.comments,
      //reactionsByMeStore: PolisStorage.reactionsByMe,
      utils: window.utils,
      protocol: "", //"http",
      domain: (-1 !== document.domain.indexOf(".polis.io")) ? "api.polis.io" : "localhost:5000",
      basePath: "",
      logger: console
    });

    serverClient.observeStimulus(this.model.get('zid'), this.model.get('zinvite'));
    

    // this.commentsByMe = new SomeViewColinWillCreate({
    //   serverClient: serverClient,
    //   zid: this.zid,
    // });


   
    var metadataCollection = new MetadataQuestionsCollection([], {
        zid: this.zid,
    });

    metadataCollection.fetch({
        data: $.param({
            zid: this.zid
        }), 
        processData: true,
    });

    var resultsCollection = new ResultsCollection()

    window.m = metadataCollection;

    // HTTP PATCH - model.save({patch: true})

    /* child views */

    this.metadataQuestionsView = new MetadataQuestionsView({
      serverClient: serverClient,
      zid: this.zid,
      collection: metadataCollection,
    });

    this.changeVotes = new ChangeVotesView({
      serverClient: serverClient,
      zid: this.zid,
    });

    this.commentView = new CommentView({
      serverClient: serverClient,
      zid: this.zid,
    });

    this.commentForm = new CommentFormView({
      serverClient: serverClient,
      zid: this.zid,
    });

    this.resultsView = new ResultsView({
      serverClient: serverClient,
      zid: this.zid,
      collection: resultsCollection
    })


    this.commentForm.on("commentSubmitted", function() {
      $("#react_tab").tab('show');
    });

    /* tooltips */
    console.log('here are the views children:')
    console.dir(this.children)




    function onClusterTapped() {
        that.onClusterTapped();
    }

    var initPcaVis = function() {
        var w = $("#visualization_div").width();
        var h = w/2;
        $("#visualization_div").height(h);
        if (vis) {
            serverClient.removePersonUpdateListener(vis.upsertNode);
        }
        vis = PcaVis({
            getPersonId: function() {
                return PolisStorage.pids.get(that.zid);
            },
            getCommentsForProjection: serverClient.getCommentsForProjection,
            getCommentsForSelection: serverClient.getCommentsForSelection,
            getReactionsToComment: serverClient.getReactionsToComment,
            getUserInfoByPid: serverClient.getUserInfoByPid,
            w: w,
            h: h,
            el_queryResultSelector: "#query_results_div",
            el: "#visualization_div"
        });
        vis.addClusterTappedListener(onClusterTapped);
        serverClient.addPersonUpdateListener(vis.upsertNode);
    };


    this.listenTo(this, 'rendered', function(){
      this.$('#commentViewTab').tooltip({
        title: "Start here - read comments submitted by others and react to each.",
        placement: "top"
      });
      this.$('#commentFormTab').tooltip({
        title: "Once you have a sense of what others have said, submit your own opinion. Others will be able to react to it.",
        placement: "top"
      });
      this.$('#analyzeTab').tooltip({
        title: "Click on the 'analyze' tab to sort participants using metadata. For instance, maybe you only want to see female respondants under 40, or only managers in the NYC office, etc. Selecting a particular metadata field fades out all participants who don't fulfill that criteria.",
        placement: "top"
      });  
    })


     // Let the DOM finish its layout
     _.defer(initPcaVis);
     $(window).resize(initPcaVis);
  }// end initialize
  });
});

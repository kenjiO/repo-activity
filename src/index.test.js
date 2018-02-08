import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { expect } from 'chai';

import getLastCommitDate from './index';
import { API_BASE } from './constants';

const axoisMock = new MockAdapter(axios);

describe('getLastCommitDate', () => {
  beforeEach(() => {
    axoisMock.reset();
  });

  it('Requests the correct API endpoint ', () => {
    axoisMock.onGet(`${API_BASE}/userX/repoY/commits`).reply(200, [
      { commit: { author: { date: '2014-02-06T16:01:33Z' } } }]);
    return getLastCommitDate('userX/repoY');
  });

  it('Returns the date when there is only one commit ', () => {
    axoisMock.onGet(`${API_BASE}/userX/repoY/commits`).reply(200, [
      { commit: { author: { date: '2014-02-06T16:01:33Z' } } }]);

    return getLastCommitDate('userX/repoY')
      .then((resolvedValue) => {
        expect(resolvedValue).to.eql('2014-02-06T16:01:33Z');
      });
  });

  it('Returns the latest commit when they are in chronological order', () => {
    axoisMock.onGet(`${API_BASE}/userX/repoY/commits`).reply(200, [
      { commit: { author: { date: '2017-02-09T16:01:33Z' } } },
      { commit: { author: { date: '2017-02-08T16:01:33Z' } } },
      { commit: { author: { date: '2017-02-07T16:01:33Z' } } },
      { commit: { author: { date: '2017-02-06T16:01:33Z' } } },
    ]);

    return getLastCommitDate('userX/repoY')
      .then((resolvedValue) => {
        expect(resolvedValue).to.eql('2017-02-09T16:01:33Z');
      });
  });

  it('Returns the latest commit when they are not in chronological order', () => {
    axoisMock.onGet(`${API_BASE}/userX/repoY/commits`).reply(200, [
      { commit: { author: { date: '2017-02-07T16:01:33Z' } } },
      { commit: { author: { date: '2017-02-08T16:01:33Z' } } },
      { commit: { author: { date: '2017-02-09T16:01:33Z' } } },
      { commit: { author: { date: '2017-02-06T16:01:33Z' } } },
    ]);

    return getLastCommitDate('userX/repoY')
      .then((resolvedValue) => {
        expect(resolvedValue).to.eql('2017-02-09T16:01:33Z');
      });
  });

  it('Takes into consideration the year of the date', () => {
    axoisMock.onGet(`${API_BASE}/userX/repoY/commits`).reply(200, [
      { commit: { author: { date: '2017-02-09T16:01:33Z' } } },
      { commit: { author: { date: '2017-02-08T16:01:33Z' } } },
      { commit: { author: { date: '2018-02-07T16:01:33Z' } } },
      { commit: { author: { date: '2017-02-06T16:01:33Z' } } },
    ]);

    return getLastCommitDate('userX/repoY')
      .then((resolvedValue) => {
        expect(resolvedValue).to.eql('2018-02-07T16:01:33Z');
      });
  });

  it('takes into consideration the month of the date', () => {
    axoisMock.onGet(`${API_BASE}/userX/repoY/commits`).reply(200, [
      { commit: { author: { date: '2017-01-09T16:01:33Z' } } },
      { commit: { author: { date: '2017-02-08T16:01:33Z' } } },
      { commit: { author: { date: '2017-01-07T16:01:33Z' } } },
      { commit: { author: { date: '2017-01-06T16:01:33Z' } } },
    ]);

    return getLastCommitDate('userX/repoY')
      .then((resolvedValue) => {
        expect(resolvedValue).to.eql('2017-02-08T16:01:33Z');
      });
  });

  it('takes into consideration the day of the date', () => {
    axoisMock.onGet(`${API_BASE}/userX/repoY/commits`).reply(200, [
      { commit: { author: { date: '2017-02-09T16:01:33Z' } } },
      { commit: { author: { date: '2017-02-08T16:01:33Z' } } },
      { commit: { author: { date: '2017-02-11T16:01:33Z' } } },
      { commit: { author: { date: '2017-02-06T16:01:33Z' } } },
    ]);

    return getLastCommitDate('userX/repoY')
      .then((resolvedValue) => {
        expect(resolvedValue).to.eql('2017-02-11T16:01:33Z');
      });
  });


  it('Errors when there is no commit property in the response', () => {
    axoisMock.onGet(`${API_BASE}/userX/repoY/commits`).reply(200, [
      {}]);

    return getLastCommitDate('userX/repoY').then(
      () => Promise.reject(new Error('promise should have rejected due to unexpected response')),
      (error) => {
        expect(error).to.be.an('error');
        expect(error.message).to.eql('Data received from Github came in unexpected format');
      },
    );
  });

  it('Errors when there is no author property in the response', () => {
    axoisMock.onGet(`${API_BASE}/userX/repoY/commits`).reply(200, [
      { commit: { } }]);

    return getLastCommitDate('userX/repoY').then(
      () => Promise.reject(new Error('promise should have rejected due to unexpected response')),
      (error) => {
        expect(error).to.be.an('error');
        expect(error.message).to.eql('Data received from Github came in unexpected format');
      },
    );
  });

  it('Errors when there is no date property ', () => {
    axoisMock.onGet(`${API_BASE}/userX/repoY/commits`).reply(200, [
      { commit: { author: { } } }]);

    return getLastCommitDate('userX/repoY').then(
      () => Promise.reject(new Error('promise should have rejected due to unexpected response')),
      (error) => {
        expect(error).to.be.an('error');
        expect(error.message).to.eql('Data received from Github came in unexpected format');
      },
    );
  });

  it('Handles network errors ', () => {
    axoisMock.onAny().networkError();
    return getLastCommitDate('userX/repoY').then(
      () => Promise.reject(new Error('promise should have rejected due to network error')),
      (error) => {
        expect(error).to.be.an('error');
        expect(error.message).to.eql('Network Error');
      },
    );
  });

  describe('argument validation', () => {
    it('Errors when called with no arguments', () => {
      axoisMock.onAny().reply(200, [
        { commit: { author: { date: '2014-02-06T16:01:33Z' } } }]);

      return getLastCommitDate()
        .then(
          () => Promise.reject(new Error('promise should have rejected due to bad argument')),
          (error) => {
            expect(error).to.be.an('error');
            expect(error.message).to.eql('Invalid Argument: Must be called with a valid repo name');
          },
        );
    });

    it('Errors when the repo argument is not a string', () => {
      axoisMock.onAny().reply(200, [
        { commit: { author: { date: '2014-02-06T16:01:33Z' } } }]);

      return getLastCommitDate({})
        .then(
          () => Promise.reject(new Error('promise should have rejected due to bad argument')),
          (error) => {
            expect(error).to.be.an('error');
            expect(error.message).to.eql('Invalid Argument: Must be called with a valid repo name');
          },
        );
    });

    it('Errors when the repo argument is an empty string', () => {
      axoisMock.onAny().reply(200, [
        { commit: { author: { date: '2014-02-06T16:01:33Z' } } }]);

      return getLastCommitDate('')
        .then(
          () => Promise.reject(new Error('promise should have rejected due to bad argument')),
          (error) => {
            expect(error).to.be.an('error');
            expect(error.message).to.eql('Invalid Argument: Must be called with a valid repo name');
          },
        );
    });

    it('Errors when the repo argument is a blank string', () => {
      axoisMock.onAny().reply(200, [
        { commit: { author: { date: '2014-02-06T16:01:33Z' } } }]);

      return getLastCommitDate(' ')
        .then(
          () => Promise.reject(new Error('promise should have rejected due to bad argument')),
          (error) => {
            expect(error).to.be.an('error');
            expect(error.message).to.eql('Invalid Argument: Must be called with a valid repo name');
          },
        );
    });

    it('Errors when there is not a "/" in the repo name', () => {
      axoisMock.onAny().reply(200, [
        { commit: { author: { date: '2014-02-06T16:01:33Z' } } }]);

      return getLastCommitDate('userXrepoY')
        .then(
          () => Promise.reject(new Error('promise should have rejected due to bad argument')),
          (error) => {
            expect(error).to.be.an('error');
            expect(error.message).to.eql('Invalid Argument: Must be called with a valid repo name');
          },
        );
    });

    it('Errors when the username part of the repo is missing', () => {
      axoisMock.onAny().reply(200, [
        { commit: { author: { date: '2014-02-06T16:01:33Z' } } }]);

      return getLastCommitDate('/repoY')
        .then(
          () => Promise.reject(new Error('promise should have rejected due to bad argument')),
          (error) => {
            expect(error).to.be.an('error');
            expect(error.message).to.eql('Invalid Argument: Must be called with a valid repo name');
          },
        );
    });

    it('Errors when the name part of the repo is missing', () => {
      axoisMock.onAny().reply(200, [
        { commit: { author: { date: '2014-02-06T16:01:33Z' } } }]);

      return getLastCommitDate('userX/')
        .then(
          () => Promise.reject(new Error('promise should have rejected due to bad argument')),
          (error) => {
            expect(error).to.be.an('error');
            expect(error.message).to.eql('Invalid Argument: Must be called with a valid repo name');
          },
        );
    });

    it('Errors when the username part of the repo is blank', () => {
      axoisMock.onAny().reply(200, [
        { commit: { author: { date: '2014-02-06T16:01:33Z' } } }]);

      return getLastCommitDate(' /repoY')
        .then(
          () => Promise.reject(new Error('promise should have rejected due to bad argument')),
          (error) => {
            expect(error).to.be.an('error');
            expect(error.message).to.eql('Invalid Argument: Must be called with a valid repo name');
          },
        );
    });

    it('Errors when the reponame part of the repo is blank', () => {
      axoisMock.onAny().reply(200, [
        { commit: { author: { date: '2014-02-06T16:01:33Z' } } }]);

      return getLastCommitDate('userX/  ')
        .then(
          () => Promise.reject(new Error('promise should have rejected due to bad argument')),
          (error) => {
            expect(error).to.be.an('error');
            expect(error.message).to.eql('Invalid Argument: Must be called with a valid repo name');
          },
        );
    });

    it('Errors when there is more than one "/" in the arugment', () => {
      axoisMock.onAny().reply(200, [
        { commit: { author: { date: '2014-02-06T16:01:33Z' } } }]);

      return getLastCommitDate('userX/repoY/')
        .then(
          () => Promise.reject(new Error('promise should have rejected due to bad argument')),
          (error) => {
            expect(error).to.be.an('error');
            expect(error.message).to.eql('Invalid Argument: Must be called with a valid repo name');
          },
        );
    });

    it('is OK with a dash in the username', () => {
      axoisMock.onAny().reply(200, [
        { commit: { author: { date: '2014-02-06T16:01:33Z' } } }]);

      return getLastCommitDate('user-X/repoY');
    });

    it('is OK with a dash in the reponame', () => {
      axoisMock.onAny().reply(200, [
        { commit: { author: { date: '2014-02-06T16:01:33Z' } } }]);

      return getLastCommitDate('user-X/repoY');
    });

    it('Errors when there is an underscore in the username', () => {
      axoisMock.onAny().reply(200, [
        { commit: { author: { date: '2014-02-06T16:01:33Z' } } }]);

      return getLastCommitDate('user_X/repoY/')
        .then(
          () => Promise.reject(new Error('promise should have rejected due to bad argument')),
          (error) => {
            expect(error).to.be.an('error');
            expect(error.message).to.eql('Invalid Argument: Must be called with a valid repo name');
          },
        );
    });

    it('is OK with an underscore in the reponame', () => {
      axoisMock.onAny().reply(200, [
        { commit: { author: { date: '2014-02-06T16:01:33Z' } } }]);

      return getLastCommitDate('userX/repo_Y');
    });

    it('Errors when there is a $ character in the username', () => {
      axoisMock.onAny().reply(200, [
        { commit: { author: { date: '2014-02-06T16:01:33Z' } } }]);

      return getLastCommitDate('user$X/repoY')
        .then(
          () => Promise.reject(new Error('promise should have rejected due to bad argument')),
          (error) => {
            expect(error).to.be.an('error');
            expect(error.message).to.eql('Invalid Argument: Must be called with a valid repo name');
          },
        );
    });

    it('Errors when there is a $ character in the reponame', () => {
      axoisMock.onAny().reply(200, [
        { commit: { author: { date: '2014-02-06T16:01:33Z' } } }]);

      return getLastCommitDate('userX/repo$Y')
        .then(
          () => Promise.reject(new Error('promise should have rejected due to bad argument')),
          (error) => {
            expect(error).to.be.an('error');
            expect(error.message).to.eql('Invalid Argument: Must be called with a valid repo name');
          },
        );
    });
  });
});

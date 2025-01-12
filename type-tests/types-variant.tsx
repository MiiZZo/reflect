/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createEvent, createStore } from 'effector';
import React from 'react';
import { expectType } from 'tsd';

import { variant } from '../src';

// basic variant usage
{
  const Input: React.FC<{
    value: string;
    onChange: (newValue: string) => void;
  }> = () => null;
  const DateTime: React.FC<{
    value: string;
    onChange: (newValue: string) => void;
  }> = () => null;
  const $value = createStore<string>('');
  const changed = createEvent<string>();
  const $type = createStore<'input' | 'datetime'>('input');

  const VariableInput = variant({
    source: $type,
    bind: {
      value: $value,
      onChange: changed,
    },
    cases: {
      input: Input,
      datetime: DateTime,
    },
  });

  expectType<React.FC>(VariableInput);
}

// variant catches incompatible props between cases
{
  const Input: React.FC<{
    value: string;
    onChange: (event: { target: { value: string } }) => void;
  }> = () => null;
  const DateTime: React.FC<{
    value: string;
    onChange: (newValue: string) => void;
  }> = () => null;
  const $value = createStore<string>('');
  const changed = createEvent<string>();
  const $type = createStore<'input' | 'datetime'>('input');

  const VariableInput = variant({
    source: $type,
    bind: {
      value: $value,
      // @ts-expect-error
      onChange: changed,
    },
    cases: {
      input: Input,
      // @ts-expect-error
      datetime: DateTime,
    },
  });

  expectType<React.FC>(VariableInput);
}

// variant warns, if no cases provided
{
  type PageProps = {
    context: {
      route: string;
    };
  };
  const NotFoundPage: React.FC<PageProps> = () => null;
  const $page = createStore<'home' | 'faq' | 'profile' | 'products'>('home');
  const $pageContext = $page.map((route) => ({ route }));

  const CurrentPage = variant({
    source: $page,
    bind: { context: $pageContext },
    // @ts-expect-error
    cases: {},
    default: NotFoundPage,
  });

  expectType<React.FC>(CurrentPage);

  const Page = variant({
    source: $page,
    bind: { context: $pageContext },
    // @ts-expect-error
    cases: [],
    default: NotFoundPage,
  });

  expectType<React.FC>(Page);
}

// variant allows to set every possble case
// for e.g. if we want to cover only specific ones and render default for the rest
{
  type PageProps = {
    context: {
      route: string;
    };
  };

  const HomePage: React.FC<PageProps> = () => null;
  const FaqPage: React.FC<PageProps> = () => null;
  const NotFoundPage: React.FC<PageProps> = () => null;
  const $page = createStore<'home' | 'faq' | 'profile' | 'products'>('home');
  const $pageContext = $page.map((route) => ({ route }));

  const CurrentPage = variant({
    source: $page,
    bind: { context: $pageContext },
    cases: {
      home: HomePage,
      faq: FaqPage,
    },
    default: NotFoundPage,
  });

  expectType<React.FC>(CurrentPage);
}

// variant warns about wrong cases
{
  type PageProps = {
    context: {
      route: string;
    };
  };

  const HomePage: React.FC<PageProps> = () => null;
  const FaqPage: React.FC<PageProps> = () => null;
  const NotFoundPage: React.FC<PageProps> = () => null;
  const $page = createStore<'home' | 'profile' | 'products'>('home');
  const $pageContext = $page.map((route) => ({ route }));

  const CurrentPage = variant({
    source: $page,
    bind: { context: $pageContext },
    cases: {
      home: HomePage,
      // @ts-expect-error
      faq: FaqPage,
    },
    default: NotFoundPage,
  });

  expectType<React.FC>(CurrentPage);
}

// overload for cases as array
{
  type PageProps = {
    context: {
      route: string;
    };
  };

  const $ctx = createStore({ route: 'home' });

  const UserProfile: React.FC<PageProps> = () => null;
  const AdminProfile: React.FC<PageProps> = () => null;
  const $user = createStore({ isAdmin: false });

  const Profile = variant({
    source: $user,
    cases: [
      {
        filter: (user) => user.isAdmin,
        view: UserProfile,
      },
      {
        filter: (user) => !user.isAdmin,
        view: AdminProfile,
      },
    ],
    bind: { context: $ctx },
  });
  expectType<React.FC>(Profile);
}

// overload for boolean source
{
  type PageProps = {
    context: {
      route: string;
    };
  };

  const $ctx = createStore({ route: 'home' });

  const HomePage: React.FC<PageProps> = () => null;
  const FallbackPage: React.FC<PageProps> = () => null;
  const $enabled = createStore(true);

  const CurrentPageThenElse = variant({
    if: $enabled,
    then: HomePage,
    else: FallbackPage,
    bind: { context: $ctx },
  });
  expectType<React.FC>(CurrentPageThenElse);

  const CurrentPageOnlyThen = variant({
    if: $enabled,
    then: HomePage,
    bind: { context: $ctx },
  });
  expectType<React.FC>(CurrentPageOnlyThen);
}

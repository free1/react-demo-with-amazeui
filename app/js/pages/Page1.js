import React from 'react';
import {
  Container,
  Group,
} from 'amazeui-touch';

const Page1 = React.createClass({
  render() {
    return (
      <Container {...this.props}>
        <Group>
          <h2>Page 1</h2>
          <p>页面内容</p>
        </Group>
      </Container>
    );
  },
});

export default Page1;

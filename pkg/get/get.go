package get

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

type GetRequest struct {
	ctx context.Context
	url string
	timeout bool
	timeoutSec int
	attempts int
}

func NewGetRequest(ctx context.Context, url string, timeout bool, timeoutSec, attempts int) *GetRequest {
	return &GetRequest{ctx: ctx, url: url, timeout: timeout, timeoutSec: timeoutSec, attempts: attempts}
}

func Get(r *GetRequest) (*http.Response, error) {
	fail := false
	var resp *http.Response
	var httpErr error
	for i := 0; i < r.attempts; i++ {
		resp, httpErr = http.Get(r.url)
		if httpErr != nil {
			fail = true
			fmt.Printf("http get attempt %d of %d to %s failed: %v\n", i+1, r.attempts, r.url, httpErr)
			if i != r.attempts - 1 {
				time.Sleep(time.Duration(r.timeoutSec) * time.Second)
			}
		}
	}
	if fail {
		msg := fmt.Sprintf("an error occured attempting to reach %s", r.url)
		var rtnErr error

		if r.ctx.Err() != nil {
			rtnErr = fmt.Errorf("%s: context error: %w", msg, r.ctx.Err())
		}
		if httpErr != nil {
			rtnErr = fmt.Errorf("%s: %w", msg, httpErr)
		} else {
			rtnErr = fmt.Errorf("%s", msg)
		}
		return resp, rtnErr
	}
	return resp, nil
}
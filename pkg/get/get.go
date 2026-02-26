package get

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

type GetRequest struct {
	ctx        context.Context
	url        string
	timeout    bool
	timeoutSec int
	attempts   int
}

func NewGetRequest(ctx context.Context, url string, timeout bool, timeoutSec, attempts int) *GetRequest {
	return &GetRequest{ctx: ctx, url: url, timeout: timeout, timeoutSec: timeoutSec, attempts: attempts}
}

func Get(r *GetRequest) (*http.Response, error) {
	var resp *http.Response
	var err error
	for i := 0; i < r.attempts; i++ {
		if r.ctx != nil && r.ctx.Err() != nil {
			return nil, fmt.Errorf("%s: context error: %w", r.ctx.Err())
		}
		resp, err = http.Get(r.url)

		if err == nil && resp != nil && resp.StatusCode >= 200 && resp.StatusCode < 300 {
			return resp, nil
		} else {
			fmt.Printf("http get attempt %d of %d to %s failed: %v\n", i+1, r.attempts, r.url, err)
			if err != nil {
				fmt.Println(err)
			}
			if resp != nil && resp.Body != nil {
				resp.Body.Close()
			}
			if i != r.attempts-1 {
				time.Sleep(time.Duration(r.timeoutSec) * time.Second)
			}
		}

	}
	return resp, fmt.Errorf("an error occured attempting to reach %s", r.url)
}
